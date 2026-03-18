import { generateText, Output } from "ai";
import pLimit from "p-limit";
import { z } from "zod";
import { assessSources } from "./credibility";
import { computeInformationGain } from "./gain";
import { getSystemPrompt } from "./prompts";
import { getModel } from "./providers";
import { getConcurrencyLimit, multiSearch } from "./search";
import { trimPrompt } from "./text-utils";
import {
  type Finding,
  type PlanAspect,
  type ResearchState,
  SerpQueriesSchema,
  type SourceRecord,
} from "./types";

const FindingsExtractionSchema = z.object({
  findings: z.array(
    z.object({
      claim: z.string(),
      evidence: z.string(),
      confidence: z.enum(["high", "medium", "low"]),
    }),
  ),
});

export interface WorkerOptions {
  maxDepth: number;
  breadth: number;
  signal?: AbortSignal;
  onFinding?: (finding: Finding) => void;
  onSource?: (source: SourceRecord) => void;
  onProgress?: (status: string) => void;
}

export interface WorkerResult {
  findings: Finding[];
  sources: SourceRecord[];
  queriesExecuted: string[];
}

function depthBudget(
  priority: PlanAspect["priority"],
  maxDepth: number,
): number {
  switch (priority) {
    case "high":
      return maxDepth;
    case "medium":
      return Math.max(1, maxDepth - 1);
    case "low":
      return Math.max(1, maxDepth - 2);
  }
}

export async function executeAspect(
  aspect: PlanAspect,
  stateSnapshot: ResearchState,
  options: WorkerOptions,
): Promise<WorkerResult> {
  const budget = depthBudget(aspect.priority, options.maxDepth);
  const allFindings: Finding[] = [];
  const allSources: SourceRecord[] = [];
  const allQueries: string[] = [];

  await research(
    aspect,
    stateSnapshot,
    allFindings,
    allSources,
    allQueries,
    options,
    budget,
    options.breadth,
  );

  return {
    findings: allFindings,
    sources: allSources,
    queriesExecuted: allQueries,
  };
}

const MAX_ROUNDS_PER_ASPECT = 6;

async function research(
  aspect: PlanAspect,
  stateSnapshot: ResearchState,
  accumulated: Finding[],
  accumulatedSources: SourceRecord[],
  accumulatedQueries: string[],
  options: WorkerOptions,
  depthRemaining: number,
  breadth: number,
  round = 0,
): Promise<void> {
  if (depthRemaining <= 0 || breadth <= 0 || round >= MAX_ROUNDS_PER_ASPECT)
    return;

  options.signal?.throwIfAborted();
  options.onProgress?.(`Digging into "${aspect.topic}"`);

  const existingClaims = [
    ...stateSnapshot.findings.map((f) => f.claim),
    ...accumulated.map((f) => f.claim),
  ];

  const previousQueries = [
    ...stateSnapshot.searchHistory,
    ...accumulatedQueries,
  ];

  const queries = await generateQueries(
    aspect,
    existingClaims,
    previousQueries,
    breadth,
    options.signal,
  );
  if (queries.length === 0) return;

  const roundFindings: Finding[] = [];
  const roundSources: SourceRecord[] = [];
  const searchLimit = pLimit(getConcurrencyLimit());

  await Promise.all(
    queries.map((q) =>
      searchLimit(async () => {
        options.signal?.throwIfAborted();
        options.onProgress?.(`Searching: ${q}`);
        accumulatedQueries.push(q);

        const results = await multiSearch(q, {
          limit: 5,
          timeout: 15000,
          scrapeContent: true,
        });
        if (results.length === 0) return;

        const sourceInputs = results.map((r) => ({
          url: r.url,
          title: r.title ?? r.url,
          snippet: r.description ?? r.markdown?.slice(0, 500) ?? "",
        }));
        const assessed = await assessSources(sourceInputs);
        for (const src of assessed) {
          roundSources.push(src);
          options.onSource?.(src);
        }

        const withContent = results.filter((r) => r.markdown && r.url);
        if (withContent.length === 0) return;

        const contents = withContent.map((r) => r.markdown as string);
        const urls = withContent.map((r) => r.url);
        const extracted = await extractFindings(
          aspect,
          q,
          contents,
          urls,
          options.signal,
        );
        for (const f of extracted) {
          roundFindings.push(f);
          options.onFinding?.(f);
        }
      }),
    ),
  );

  accumulated.push(...roundFindings);
  accumulatedSources.push(...roundSources);

  if (roundFindings.length === 0) return;

  const existingForGain = [
    ...stateSnapshot.findings.filter((f) => f.aspect === aspect.id),
    ...accumulated.filter((f) => !roundFindings.includes(f)),
  ];

  const gain = await computeInformationGain(roundFindings, existingForGain);

  switch (gain.decision) {
    case "go-deeper":
      await research(
        aspect,
        stateSnapshot,
        accumulated,
        accumulatedSources,
        accumulatedQueries,
        options,
        depthRemaining,
        breadth,
        round + 1,
      );
      break;
    case "continue":
      await research(
        aspect,
        stateSnapshot,
        accumulated,
        accumulatedSources,
        accumulatedQueries,
        options,
        depthRemaining - 1,
        Math.ceil(breadth / 2),
        round + 1,
      );
      break;
    case "stop":
      break;
  }
}

async function generateQueries(
  aspect: PlanAspect,
  existingClaims: string[],
  previousQueries: string[],
  numQueries: number,
  signal?: AbortSignal,
): Promise<string[]> {
  const learningsContext =
    existingClaims.length > 0
      ? `\n\nAlready known (avoid redundant queries):\n${existingClaims
          .slice(-10)
          .map((c) => `- ${c}`)
          .join("\n")}`
      : "";

  const prevQueriesContext =
    previousQueries.length > 0
      ? `\n\nPrevious queries (do NOT repeat these):\n${previousQueries
          .slice(-10)
          .map((q) => `- ${q}`)
          .join("\n")}`
      : "";

  const subQuestionsStr = aspect.subQuestions.map((q) => `- ${q}`).join("\n");

  const prompt = `Generate up to ${numQueries} search queries to investigate the following research aspect.

Aspect: ${aspect.topic}
Description: ${aspect.description}

Sub-questions to answer:
${subQuestionsStr}
${learningsContext}${prevQueriesContext}

Each query should target a specific sub-question or angle. Avoid overlap between queries.`;

  try {
    const { output } = await generateText({
      model: getModel("fast"),
      system: getSystemPrompt(),
      prompt,
      output: Output.object({ schema: SerpQueriesSchema }),
      abortSignal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(30_000)])
        : AbortSignal.timeout(30_000),
    });

    if (!output) return aspect.subQuestions.slice(0, numQueries);
    return output.queries.map((q) => q.query).slice(0, numQueries);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    console.error(
      `Query generation failed for "${aspect.topic}":`,
      error instanceof Error ? error.message : String(error),
    );
    return aspect.subQuestions.slice(0, numQueries);
  }
}

async function extractFindings(
  aspect: PlanAspect,
  query: string,
  contents: string[],
  sourceUrls: string[],
  signal?: AbortSignal,
): Promise<Finding[]> {
  const trimmed = contents.map((c) => trimPrompt(c, 25_000));
  const contentsStr = trimmed
    .map((c) => `<content>\n${c}\n</content>`)
    .join("\n");

  const prompt = `Extract structured research findings from the search results below.

Research aspect: ${aspect.topic}
Search query: ${query}

For each finding:
- claim: A precise, factual assertion (include specific numbers, names, dates when available)
- evidence: The supporting text or data from the source
- confidence: "high" if multiple sources agree or it's from a primary source, "medium" if single credible source, "low" if uncertain or from opinion piece

<contents>${contentsStr}</contents>`;

  try {
    const { output } = await generateText({
      model: getModel("fast"),
      system: getSystemPrompt(),
      prompt,
      output: Output.object({ schema: FindingsExtractionSchema }),
      abortSignal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(60_000)])
        : AbortSignal.timeout(60_000),
    });

    if (!output) return [];

    return output.findings.map((f) => ({
      id: crypto.randomUUID(),
      claim: f.claim,
      evidence: f.evidence,
      sourceUrls,
      confidence: f.confidence,
      aspect: aspect.id,
    }));
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    console.error(
      `Finding extraction failed for "${query}":`,
      error instanceof Error ? error.message : String(error),
    );
    return [];
  }
}
