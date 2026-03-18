import { generateText, Output } from "ai";
import pLimit from "p-limit";
import { getSystemPrompt } from "./prompts";
import { getModel, throttledGenerate } from "./providers";
import {
  addContradiction,
  addFinding,
  addSource,
  addToSearchHistory,
  createResearchState,
  getRelevantFindings,
  updateCoverage,
} from "./state";
import type {
  Finding,
  PlanAspect,
  ResearchPlan,
  ResearchProgress,
  ResearchState,
  SourceRecord,
} from "./types";
import { ContradictionCheckSchema } from "./types";
import { executeAspect, type WorkerResult } from "./workers";

const MAX_CONCURRENT_WORKERS = 3;
const MAX_GAP_FILL_ROUNDS = 2;
const MIN_FINDINGS_FOR_COMPLETE = 2;

export interface OrchestrateOptions {
  query: string;
  breadth: number;
  depth: number;
  plan: ResearchPlan;
  signal?: AbortSignal;
  onProgress?: (progress: ResearchProgress) => void;
  onFinding?: (finding: Finding) => void;
  onSource?: (source: SourceRecord) => void;
  onAspectComplete?: (aspectId: string, result: WorkerResult) => void;
}

export async function orchestrate({
  query,
  breadth,
  depth,
  plan,
  signal,
  onProgress,
  onFinding,
  onSource,
  onAspectComplete,
}: OrchestrateOptions): Promise<ResearchState> {
  let state = createResearchState(query, plan);
  const limit = pLimit(MAX_CONCURRENT_WORKERS);
  let aspectsComplete = 0;

  const emitProgress = (status: string, aspectName?: string) => {
    onProgress?.({
      totalQueries: plan.estimatedSearches,
      completedQueries: aspectsComplete,
      currentAspect: aspectName,
      aspectsComplete,
      aspectsTotal: plan.aspects.length,
      findingsCount: state.findings.length,
      sourcesAssessed: state.sources.size,
      status,
    });
  };

  emitProgress("Starting research");

  const workerTasks = plan.aspects.map((aspect) =>
    limit(async () => {
      signal?.throwIfAborted();

      emitProgress(`Exploring: ${aspect.topic}`, aspect.topic);

      return {
        aspect,
        result: await executeAspect(aspect, structuredClone(state), {
          maxDepth: depth,
          breadth,
          signal,
          onFinding,
          onSource,
          onProgress: (status) => emitProgress(status, aspect.topic),
        }),
      };
    }),
  );

  const settled = await Promise.allSettled(workerTasks);

  for (let i = 0; i < settled.length; i++) {
    const outcome = settled[i];
    if (outcome.status === "rejected") {
      const aspect = plan.aspects[i];
      const reason =
        outcome.reason instanceof Error
          ? outcome.reason.message
          : String(outcome.reason);
      console.error(`Worker failed for "${aspect.topic}":`, reason);
      emitProgress(`Failed: ${aspect.topic} — ${reason}`, aspect.topic);
      continue;
    }
    const { aspect, result } = outcome.value;
    state = mergeWorkerResult(state, aspect, result);
    aspectsComplete++;
    onAspectComplete?.(aspect.id, result);
    emitProgress(
      `Done with ${aspect.topic} — ${result.findings.length} findings`,
      aspect.topic,
    );
  }

  for (let round = 0; round < MAX_GAP_FILL_ROUNDS; round++) {
    signal?.throwIfAborted();

    const gaps = findGaps(state);
    if (gaps.length === 0) break;

    emitProgress(
      `Filling gaps — ${gaps.length} area${gaps.length > 1 ? "s" : ""} need more depth`,
    );

    const gapTasks = gaps.map((aspect) =>
      limit(async () => {
        signal?.throwIfAborted();

        emitProgress(`Going deeper on ${aspect.topic}`, aspect.topic);

        return {
          aspect,
          result: await executeAspect(aspect, structuredClone(state), {
            maxDepth: Math.max(1, depth - 1),
            breadth: Math.ceil(breadth / 2),
            signal,
            onFinding,
            onSource,
            onProgress: (status) => emitProgress(status, aspect.topic),
          }),
        };
      }),
    );

    const gapSettled = await Promise.allSettled(gapTasks);

    for (const outcome of gapSettled) {
      if (outcome.status === "rejected") continue;
      const { aspect, result } = outcome.value;
      state = mergeWorkerResult(state, aspect, result);
      onAspectComplete?.(aspect.id, result);
    }
  }

  state = await detectContradictions(state, signal);

  emitProgress(
    `Found ${state.findings.length} findings across ${state.sources.size} sources`,
  );

  return state;
}

function mergeWorkerResult(
  state: ResearchState,
  aspect: PlanAspect,
  result: WorkerResult,
): ResearchState {
  let s = state;

  for (const finding of result.findings) {
    s = addFinding(s, finding);
  }

  for (const source of result.sources) {
    s = addSource(s, source);
  }

  for (const query of result.queriesExecuted) {
    s = addToSearchHistory(s, query);
  }

  const aspectFindings = getRelevantFindings(s, aspect.id);
  const coverage: "complete" | "partial" | "missing" =
    aspectFindings.length >= MIN_FINDINGS_FOR_COMPLETE
      ? "complete"
      : aspectFindings.length > 0
        ? "partial"
        : "missing";

  s = updateCoverage(s, aspect.id, coverage);

  return s;
}

function findGaps(state: ResearchState): PlanAspect[] {
  return state.plan.aspects.filter((aspect) => {
    const status = state.coverageMap.get(aspect.id);
    return status === "missing" || status === "partial";
  });
}

async function detectContradictions(
  state: ResearchState,
  signal?: AbortSignal,
): Promise<ResearchState> {
  if (state.findings.length < 2) return state;

  const aspectGroups = new Map<string, Finding[]>();
  for (const f of state.findings) {
    const group = aspectGroups.get(f.aspect) ?? [];
    group.push(f);
    aspectGroups.set(f.aspect, group);
  }

  let s = state;

  for (const [aspectId, findings] of aspectGroups) {
    if (findings.length < 2) continue;

    const claimsList = findings.map((f, i) => `[${i}] ${f.claim}`).join("\n");

    try {
      const { output } = await throttledGenerate("fast", () =>
        generateText({
          model: getModel("fast"),
          system: getSystemPrompt(),
          prompt: `Review the following research findings from the same topic area and identify any contradictions — pairs of claims that assert conflicting or incompatible things.

<findings>
${claimsList}
</findings>

Only flag genuine factual contradictions, not complementary findings or findings about different sub-topics. Return an empty array if there are no contradictions.`,
          output: Output.object({ schema: ContradictionCheckSchema }),
          abortSignal: signal
            ? AbortSignal.any([signal, AbortSignal.timeout(30_000)])
            : AbortSignal.timeout(30_000),
        }),
      );

      if (output?.contradictions) {
        for (const c of output.contradictions) {
          const findingA = findings.find((f) => f.claim === c.claimA);
          const findingB = findings.find((f) => f.claim === c.claimB);
          s = addContradiction(s, {
            topic: c.topic || aspectId,
            positions: [
              {
                claim: c.claimA,
                sourceUrls: findingA?.sourceUrls ?? [],
              },
              {
                claim: c.claimB,
                sourceUrls: findingB?.sourceUrls ?? [],
              },
            ],
          });
        }
      }
    } catch {
      // Non-critical — skip contradiction detection on failure
    }
  }

  return s;
}
