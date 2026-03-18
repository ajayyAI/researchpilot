import type {
  Contradiction,
  Finding,
  ResearchPlan,
  ResearchState,
  SourceRecord,
} from "./types";

export function createResearchState(
  query: string,
  plan: ResearchPlan,
): ResearchState {
  return {
    query,
    plan,
    findings: [],
    contradictions: [],
    sources: new Map(),
    coverageMap: new Map(plan.aspects.map((a) => [a.id, "missing" as const])),
    searchHistory: [],
  };
}

export function addFinding(
  state: ResearchState,
  finding: Finding,
): ResearchState {
  const isDuplicate = state.findings.some(
    (f) => f.claim.toLowerCase() === finding.claim.toLowerCase(),
  );
  if (isDuplicate) return state;

  return { ...state, findings: [...state.findings, finding] };
}

export function addSource(
  state: ResearchState,
  source: SourceRecord,
): ResearchState {
  const newSources = new Map(state.sources);
  newSources.set(source.url, source);
  return { ...state, sources: newSources };
}

export function addContradiction(
  state: ResearchState,
  contradiction: Contradiction,
): ResearchState {
  return {
    ...state,
    contradictions: [...state.contradictions, contradiction],
  };
}

export function updateCoverage(
  state: ResearchState,
  aspectId: string,
  status: "complete" | "partial" | "missing",
): ResearchState {
  const newCoverage = new Map(state.coverageMap);
  newCoverage.set(aspectId, status);
  return { ...state, coverageMap: newCoverage };
}

export function getRelevantFindings(
  state: ResearchState,
  aspectId: string,
): Finding[] {
  return state.findings.filter((f) => f.aspect === aspectId);
}

export function addToSearchHistory(
  state: ResearchState,
  query: string,
): ResearchState {
  if (state.searchHistory.includes(query)) return state;
  return { ...state, searchHistory: [...state.searchHistory, query] };
}

export interface SerializedResearchState {
  query: string;
  plan: ResearchPlan;
  findings: Finding[];
  contradictions: Contradiction[];
  sources: Record<string, SourceRecord>;
  coverageMap: Record<string, "complete" | "partial" | "missing">;
  searchHistory: string[];
}

export function serializeState(state: ResearchState): SerializedResearchState {
  return {
    ...state,
    sources: Object.fromEntries(state.sources),
    coverageMap: Object.fromEntries(state.coverageMap),
  };
}

export function deserializeState(data: SerializedResearchState): ResearchState {
  return {
    ...data,
    sources: new Map(Object.entries(data.sources)),
    coverageMap: new Map(Object.entries(data.coverageMap)),
  };
}
