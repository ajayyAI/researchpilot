export { assessSources } from "./credibility";
export type { OrchestrateOptions } from "./engine";
export { orchestrate } from "./engine";
export { generateFeedback } from "./feedback";
export type { GainDecision, GainResult } from "./gain";
export { computeInformationGain, GAIN_HIGH, GAIN_NORMAL } from "./gain";
export { createFallbackPlan, generateResearchPlan } from "./planner";
export { getModel, throttledGenerate } from "./providers";
export { generateReport } from "./report-pipeline";
export { multiSearch, searchWeb } from "./search";
export type { SerializedResearchState } from "./state";
export {
  addContradiction,
  addFinding,
  addSource,
  addToSearchHistory,
  createResearchState,
  deserializeState,
  getRelevantFindings,
  serializeState,
  updateCoverage,
} from "./state";
export { trimPrompt } from "./text-utils";
export type {
  Contradiction,
  EffortLevel,
  Finding,
  PlanAspect,
  ReportOutline,
  ResearchPlan,
  ResearchProgress,
  ResearchState,
  SearchResult,
  SourceRecord,
} from "./types";
export {
  BatchSourceAssessmentSchema,
  ContradictionCheckSchema,
  EFFORT_DEFAULTS,
  InformationGainSchema,
  PlanAspectSchema,
  ReportOutlineSchema,
  ReportSectionSchema,
  ResearchPlanSchema,
  SourceAssessmentSchema,
} from "./types";
export type { WorkerOptions, WorkerResult } from "./workers";
export { executeAspect } from "./workers";
