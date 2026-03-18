import { generateText, Output } from "ai";
import { getSystemPrompt } from "./prompts";
import { getModel, throttledGenerate } from "./providers";
import { BatchSourceAssessmentSchema, type SourceRecord } from "./types";

const DOMAIN_SCORES: Record<string, number> = {
  gov: 0.9,
  edu: 0.85,
  "arxiv.org": 0.9,
  "nature.com": 0.9,
  "science.org": 0.9,
  "ieee.org": 0.85,
  "acm.org": 0.85,
  "nih.gov": 0.9,
  "who.int": 0.85,
  "reuters.com": 0.8,
  "apnews.com": 0.8,
  "github.com": 0.7,
  "stackoverflow.com": 0.7,
  "wikipedia.org": 0.65,
  "medium.com": 0.45,
  "substack.com": 0.5,
  "reddit.com": 0.35,
  "twitter.com": 0.3,
  "x.com": 0.3,
  "quora.com": 0.35,
};

function getDomainHeuristic(url: string): {
  score: number;
  confident: boolean;
} {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");

    if (DOMAIN_SCORES[hostname] !== undefined) {
      return { score: DOMAIN_SCORES[hostname], confident: true };
    }

    const tld = hostname.split(".").pop() || "";
    if (DOMAIN_SCORES[tld] !== undefined) {
      return { score: DOMAIN_SCORES[tld], confident: true };
    }

    for (const [domain, score] of Object.entries(DOMAIN_SCORES)) {
      if (hostname.endsWith(`.${domain}`) || hostname === domain) {
        return { score, confident: true };
      }
    }

    return { score: 0.5, confident: false };
  } catch {
    return { score: 0.5, confident: false };
  }
}

function classifySourceType(url: string): SourceRecord["sourceType"] {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");

    if (hostname.endsWith(".gov") || hostname.endsWith(".int"))
      return "official";
    if (
      hostname.endsWith(".edu") ||
      hostname.includes("arxiv") ||
      hostname.includes("ieee") ||
      hostname.includes("acm.org")
    )
      return "primary";
    if (
      hostname.includes("medium.com") ||
      hostname.includes("substack") ||
      hostname.includes("blog")
    )
      return "opinion";
    if (
      hostname.includes("reuters") ||
      hostname.includes("apnews") ||
      hostname.includes("wikipedia")
    )
      return "secondary";

    return "unknown";
  } catch {
    return "unknown";
  }
}

function getSourceAssessmentPrompt(
  sources: Array<{ url: string; title: string; snippet: string }>,
): string {
  const sourcesList = sources
    .map(
      (s, i) =>
        `<source index="${i}">
URL: ${s.url}
Title: ${s.title}
Content preview: ${s.snippet.slice(0, 500)}
</source>`,
    )
    .join("\n\n");

  return `Assess the credibility of each source below. For each source, provide:
- credibilityScore (0-1): How reliable is this source? Consider domain reputation, content quality signals (citations, data, methodology), author expertise indicators, and recency.
- sourceType: Classify as "primary" (original research, official docs), "secondary" (news, analysis), "opinion" (blogs, editorials), "official" (government, institutional), or "unknown".
- reasoning: Brief explanation of your assessment.

Return assessments in the same order as the sources.

${sourcesList}`;
}

export async function assessSources(
  results: Array<{ url: string; title: string; snippet: string }>,
  signal?: AbortSignal,
): Promise<SourceRecord[]> {
  if (results.length === 0) return [];

  const now = new Date().toISOString();
  const records: SourceRecord[] = [];
  const needsLlmAssessment: Array<{
    index: number;
    url: string;
    title: string;
    snippet: string;
  }> = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    let hostname: string;
    try {
      hostname = new URL(r.url).hostname.replace(/^www\./, "");
    } catch {
      hostname = r.url;
    }
    const heuristic = getDomainHeuristic(r.url);

    records.push({
      url: r.url,
      title: r.title,
      credibilityScore: heuristic.score,
      sourceType: classifySourceType(r.url),
      domain: hostname,
      accessedAt: now,
    });

    if (!heuristic.confident) {
      needsLlmAssessment.push({ index: i, ...r });
    }
  }

  if (needsLlmAssessment.length > 0) {
    try {
      const prompt = getSourceAssessmentPrompt(needsLlmAssessment);

      const { output } = await throttledGenerate("fast", () =>
        generateText({
          model: getModel("fast"),
          system: getSystemPrompt(),
          prompt,
          output: Output.object({
            schema: BatchSourceAssessmentSchema,
          }),
          abortSignal: signal
            ? AbortSignal.any([signal, AbortSignal.timeout(30_000)])
            : AbortSignal.timeout(30_000),
        }),
      );

      if (output?.assessments) {
        for (
          let i = 0;
          i < Math.min(output.assessments.length, needsLlmAssessment.length);
          i++
        ) {
          const assessment = output.assessments[i];
          const originalIndex = needsLlmAssessment[i].index;
          records[originalIndex].credibilityScore = assessment.credibilityScore;
          records[originalIndex].sourceType = assessment.sourceType;
        }
      }
    } catch (error) {
      console.error(
        "LLM source assessment failed, using heuristic scores:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return records;
}
