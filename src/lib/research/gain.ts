import { generateText, Output } from "ai";
import { getSystemPrompt } from "./prompts";
import { getModel, throttledGenerate } from "./providers";
import { type Finding, InformationGainSchema } from "./types";

export const GAIN_HIGH = 0.7;
export const GAIN_NORMAL = 0.3;

export type GainDecision = "go-deeper" | "continue" | "stop";

export interface GainResult {
  score: number;
  decision: GainDecision;
  novelClaims: string[];
  rationale: string;
}

export async function computeInformationGain(
  newFindings: Finding[],
  existingFindings: Finding[],
  signal?: AbortSignal,
): Promise<GainResult> {
  if (existingFindings.length === 0) {
    return {
      score: 1.0,
      decision: "go-deeper",
      novelClaims: newFindings.map((f) => f.claim),
      rationale: "First round of findings — all novel.",
    };
  }

  if (newFindings.length === 0) {
    return {
      score: 0,
      decision: "stop",
      novelClaims: [],
      rationale: "No new findings extracted.",
    };
  }

  try {
    const prompt = getGainAssessmentPrompt(newFindings, existingFindings);

    const { output } = await throttledGenerate("fast", () =>
      generateText({
        model: getModel("fast"),
        system: getSystemPrompt(),
        prompt,
        output: Output.object({
          schema: InformationGainSchema,
        }),
        abortSignal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(30_000)])
          : AbortSignal.timeout(30_000),
      }),
    );

    if (!output) {
      return heuristicGain(newFindings, existingFindings);
    }

    const score = output.noveltyScore;
    return {
      score,
      decision:
        score > GAIN_HIGH
          ? "go-deeper"
          : score > GAIN_NORMAL
            ? "continue"
            : "stop",
      novelClaims: output.novelClaims,
      rationale: output.rationale,
    };
  } catch (error) {
    console.error(
      "Information gain assessment failed:",
      error instanceof Error ? error.message : String(error),
    );
    return heuristicGain(newFindings, existingFindings);
  }
}

function heuristicGain(
  newFindings: Finding[],
  existingFindings: Finding[],
): GainResult {
  const existingClaims = new Set(
    existingFindings.map((f) => f.claim.toLowerCase().trim()),
  );

  const novelClaims = newFindings.filter(
    (f) => !existingClaims.has(f.claim.toLowerCase().trim()),
  );

  const score =
    newFindings.length > 0 ? novelClaims.length / newFindings.length : 0;

  return {
    score,
    decision:
      score > GAIN_HIGH
        ? "go-deeper"
        : score > GAIN_NORMAL
          ? "continue"
          : "stop",
    novelClaims: novelClaims.map((f) => f.claim),
    rationale: `Heuristic: ${novelClaims.length}/${newFindings.length} findings are novel (exact match dedup).`,
  };
}

function getGainAssessmentPrompt(
  newFindings: Finding[],
  existingFindings: Finding[],
): string {
  const existingStr = existingFindings.map((f) => `- ${f.claim}`).join("\n");
  const newStr = newFindings.map((f) => `- ${f.claim}`).join("\n");

  return `Assess how much new information the latest research findings add to existing knowledge.

## Existing findings (what we already know):
${existingStr}

## New findings (just discovered):
${newStr}

## Instructions
- Rate noveltyScore from 0.0 to 1.0:
  - 0.0 = new findings are entirely redundant with existing knowledge
  - 0.5 = mix of some new information and some redundancy
  - 1.0 = new findings are entirely novel, covering aspects not in existing findings
- List the specific claims in the new findings that are NOT covered by existing findings
- Provide a brief rationale for your score

Consider semantic similarity, not just exact text matching. Two findings that say the same thing in different words should be considered redundant.`;
}
