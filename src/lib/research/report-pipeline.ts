import { generateText, Output } from "ai";
import pLimit from "p-limit";
import { z } from "zod";
import { getSystemPrompt } from "./prompts";
import { getModel } from "./providers";
import { getRelevantFindings } from "./state";
import { trimPrompt } from "./text-utils";
import {
  type Finding,
  type ReportOutline,
  ReportOutlineSchema,
  ReportSectionSchema,
  type ResearchState,
  type SourceRecord,
} from "./types";

const REPORT_SECTION_CONCURRENCY = 3;

interface ReportEvents {
  onOutline?: (outline: ReportOutline) => void;
  onSection?: (sectionId: string, markdown: string) => void;
  onStatus?: (status: string) => void;
  signal?: AbortSignal;
}

function makeSignal(base?: AbortSignal, timeoutMs = 120_000): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  return base ? AbortSignal.any([base, timeout]) : timeout;
}

export async function generateReport(
  state: ResearchState,
  events?: ReportEvents,
): Promise<string> {
  const signal = events?.signal;

  events?.onStatus?.("Outlining the report...");
  const outline = await generateOutline(state, signal);
  events?.onOutline?.(outline);

  events?.onStatus?.("Writing each section...");
  const sectionMarkdowns = await generateSections(state, outline, events);

  events?.onStatus?.("Wrapping up...");
  const { intro, conclusion } = await generateIntroConclusion(
    state,
    outline,
    sectionMarkdowns,
    signal,
  );

  events?.onStatus?.("Putting it all together...");
  return assembleReport(outline, intro, sectionMarkdowns, conclusion, state);
}

async function generateOutline(
  state: ResearchState,
  signal?: AbortSignal,
): Promise<ReportOutline> {
  const coverageSummary = Array.from(state.coverageMap.entries())
    .map(([id, status]) => {
      const count = getRelevantFindings(state, id).length;
      const aspect = state.plan.aspects.find((a) => a.id === id);
      return `- ${aspect?.topic ?? id}: ${status} (${count} findings)`;
    })
    .join("\n");

  const prompt = `Generate a report outline for the research query below.

<query>${state.query}</query>

<plan_scope>${state.plan.scope}</plan_scope>

<aspects>
${state.plan.aspects.map((a) => `- ${a.id}: ${a.topic} — ${a.description}`).join("\n")}
</aspects>

<coverage>
${coverageSummary}
</coverage>

Total findings: ${state.findings.length}

Return a title and 3-7 sections. Each section should list the plan aspect IDs it draws from and the key points it should cover. Order sections for narrative flow.`;

  const { output } = await generateText({
    model: getModel("smart"),
    system: getSystemPrompt(),
    prompt: trimPrompt(prompt),
    output: Output.object({ schema: ReportOutlineSchema }),
    abortSignal: makeSignal(signal),
  });

  if (!output) {
    return {
      title: "Research Report",
      sections: state.plan.aspects.map((a) => ({
        id: a.id,
        heading: a.topic,
        keyPoints: a.subQuestions,
        relevantAspects: [a.id],
      })),
    };
  }

  return output;
}

async function generateSections(
  state: ResearchState,
  outline: ReportOutline,
  events?: ReportEvents,
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const limit = pLimit(REPORT_SECTION_CONCURRENCY);

  const sectionPromises = outline.sections.map((section) =>
    limit(async () => {
      events?.signal?.throwIfAborted();

      const findings = collectFindingsForSection(
        state,
        section.relevantAspects,
      );
      const sourcesContext = buildSourcesContext(state, findings);

      const prompt = `Write the "${section.heading}" section of a research report.

<key_points>
${section.keyPoints.map((p) => `- ${p}`).join("\n")}
</key_points>

<findings>
${formatFindings(findings, state)}
</findings>

<sources>
${sourcesContext}
</sources>

Write in expert analytical prose. Use inline markdown links to cite sources where relevant. Include specific data points, metrics, and named entities. Do not include a section heading — it will be added during assembly.`;

      const { output } = await generateText({
        model: getModel("smart"),
        system: getSystemPrompt(),
        prompt: trimPrompt(prompt),
        output: Output.object({ schema: ReportSectionSchema }),
        abortSignal: makeSignal(events?.signal),
      });

      const markdown =
        output?.sectionMarkdown ?? `*No content generated for this section.*`;
      results.set(section.id, markdown);
      events?.onSection?.(section.id, markdown);
    }),
  );

  await Promise.all(sectionPromises);
  return results;
}

async function generateIntroConclusion(
  state: ResearchState,
  outline: ReportOutline,
  sectionMarkdowns: Map<string, string>,
  signal?: AbortSignal,
): Promise<{ intro: string; conclusion: string }> {
  const sectionSummaries = outline.sections
    .map((s) => {
      const content = sectionMarkdowns.get(s.id) ?? "";
      const brief = content.slice(0, 200).trim();
      return `- **${s.heading}**: ${brief}...`;
    })
    .join("\n");

  const prompt = `Write an introduction and conclusion for a research report.

<query>${state.query}</query>
<scope>${state.plan.scope}</scope>
<total_findings>${state.findings.length}</total_findings>
<total_sources>${state.sources.size}</total_sources>

<section_summaries>
${sectionSummaries}
</section_summaries>

Return a JSON object with "introduction" and "conclusion" fields, both as markdown strings.
- Introduction: 1-2 paragraphs framing the research question, methodology, and scope.
- Conclusion: 2-3 paragraphs synthesizing key themes, noting limitations, and suggesting further research directions. End with a "Key Takeaways" subsection listing the 3-5 most important insights as bullet points.`;

  const IntroConclSchema = z.object({
    introduction: z.string(),
    conclusion: z.string(),
  });

  const { output } = await generateText({
    model: getModel("smart"),
    system: getSystemPrompt(),
    prompt: trimPrompt(prompt),
    output: Output.object({ schema: IntroConclSchema }),
    abortSignal: makeSignal(signal),
  });

  return {
    intro: output?.introduction ?? "",
    conclusion: output?.conclusion ?? "",
  };
}

function assembleReport(
  outline: ReportOutline,
  intro: string,
  sectionMarkdowns: Map<string, string>,
  conclusion: string,
  state: ResearchState,
): string {
  const parts: string[] = [];

  parts.push(`# ${outline.title}\n`);

  if (intro) {
    parts.push(`${intro}\n`);
  }

  for (const section of outline.sections) {
    const content = sectionMarkdowns.get(section.id) ?? "";
    parts.push(`## ${section.heading}\n`);
    parts.push(`${content}\n`);
  }

  if (conclusion) {
    parts.push(`## Conclusion\n`);
    parts.push(`${conclusion}\n`);
  }

  parts.push(buildSourcesSection(state));

  return parts.join("\n");
}

function collectFindingsForSection(
  state: ResearchState,
  aspectIds: string[],
): Finding[] {
  const seen = new Set<string>();
  const findings: Finding[] = [];
  for (const aspectId of aspectIds) {
    for (const f of getRelevantFindings(state, aspectId)) {
      if (!seen.has(f.id)) {
        seen.add(f.id);
        findings.push(f);
      }
    }
  }
  return findings;
}

function formatFindings(findings: Finding[], state?: ResearchState): string {
  if (findings.length === 0) return "(no findings)";

  const scored = findings.map((f) => {
    const avgCredibility = state
      ? f.sourceUrls.reduce((sum, url) => {
          const src = state.sources.get(url);
          return sum + (src?.credibilityScore ?? 0.5);
        }, 0) / Math.max(f.sourceUrls.length, 1)
      : 0.5;
    return { ...f, avgCredibility };
  });
  scored.sort((a, b) => b.avgCredibility - a.avgCredibility);

  return scored
    .map(
      (f) =>
        `[${f.confidence}, credibility: ${(f.avgCredibility * 100).toFixed(0)}%] ${f.claim}\n  Evidence: ${f.evidence}\n  Sources: ${f.sourceUrls.join(", ")}`,
    )
    .join("\n\n");
}

function buildSourcesContext(
  state: ResearchState,
  findings: Finding[],
): string {
  const urls = new Set(findings.flatMap((f) => f.sourceUrls));
  const sources: SourceRecord[] = [];
  for (const url of urls) {
    const record = state.sources.get(url);
    if (record) sources.push(record);
  }
  if (sources.length === 0) return "(no source metadata)";
  return sources
    .map(
      (s) =>
        `${s.url} — ${s.title} [${s.sourceType}, credibility: ${s.credibilityScore}]`,
    )
    .join("\n");
}

function buildSourcesSection(state: ResearchState): string {
  const allUrls = new Set(state.findings.flatMap((f) => f.sourceUrls));
  const sources: SourceRecord[] = [];
  for (const url of allUrls) {
    const record = state.sources.get(url);
    if (record) sources.push(record);
  }

  sources.sort((a, b) => b.credibilityScore - a.credibilityScore);

  if (sources.length === 0) return "";

  const lines = sources.map(
    (s) =>
      `- [${s.title}](${s.url}) — ${s.sourceType}, credibility: ${(s.credibilityScore * 100).toFixed(0)}%`,
  );

  return `## Sources\n\n${lines.join("\n")}\n`;
}
