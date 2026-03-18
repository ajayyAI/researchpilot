import { z } from "zod";

export interface ResearchProgress {
  totalQueries: number;
  completedQueries: number;
  currentAspect?: string;
  aspectsComplete: number;
  aspectsTotal: number;
  findingsCount: number;
  sourcesAssessed: number;
  status?: string;
}

export const SerpQuerySchema = z.object({
  query: z.string().describe("The SERP query to execute"),
  researchGoal: z
    .string()
    .describe(
      "The goal of this query and how to advance research once results are found. Include specific follow-up directions.",
    ),
});

export const SerpQueriesSchema = z.object({
  queries: z.array(SerpQuerySchema).describe("List of SERP queries to execute"),
});

export const FeedbackSchema = z.object({
  questions: z
    .array(z.string())
    .describe(
      "Follow-up questions to clarify research direction before starting",
    ),
});

export interface SearchResult {
  url: string;
  title?: string;
  description?: string;
  markdown?: string;
}

export interface SourceRecord {
  url: string;
  title: string;
  credibilityScore: number; // 0-1
  sourceType: "primary" | "secondary" | "opinion" | "official" | "unknown";
  domain: string;
  accessedAt: string;
}

export interface Finding {
  id: string;
  claim: string;
  evidence: string;
  sourceUrls: string[];
  confidence: "high" | "medium" | "low";
  aspect: string;
}

export interface Contradiction {
  topic: string;
  positions: Array<{ claim: string; sourceUrls: string[] }>;
}

export interface ResearchState {
  query: string;
  plan: ResearchPlan;
  findings: Finding[];
  contradictions: Contradiction[];
  sources: Map<string, SourceRecord>;
  coverageMap: Map<string, "complete" | "partial" | "missing">;
  searchHistory: string[];
}

export type EffortLevel = "quick" | "thorough" | "deep";

export const EFFORT_DEFAULTS: Record<
  EffortLevel,
  { breadth: number; depth: number }
> = {
  quick: { breadth: 2, depth: 1 },
  thorough: { breadth: 4, depth: 2 },
  deep: { breadth: 7, depth: 3 },
};

export const PlanAspectSchema = z.object({
  id: z.string().describe("Unique identifier for this aspect"),
  topic: z.string().describe("Short label for this research aspect"),
  description: z.string().describe("What needs to be investigated"),
  subQuestions: z.array(z.string()).describe("Specific questions to answer"),
  priority: z.enum(["high", "medium", "low"]),
  expectedSourceTypes: z.array(z.string()).optional(),
});

export const ResearchPlanSchema = z.object({
  aspects: z.array(PlanAspectSchema).min(1).max(7),
  estimatedSearches: z.number().describe("Estimated total search queries"),
  successCriteria: z
    .array(z.string())
    .describe("What constitutes complete research"),
  scope: z.string().describe("Explicit boundaries of this research"),
});

export type PlanAspect = z.infer<typeof PlanAspectSchema>;
export type ResearchPlan = z.infer<typeof ResearchPlanSchema>;

export const SourceAssessmentSchema = z.object({
  credibilityScore: z.number().min(0).max(1),
  sourceType: z.enum([
    "primary",
    "secondary",
    "opinion",
    "official",
    "unknown",
  ]),
  reasoning: z.string().describe("Brief explanation of score"),
});

export const BatchSourceAssessmentSchema = z.object({
  assessments: z.array(SourceAssessmentSchema),
});

export const ReportOutlineSchema = z.object({
  title: z.string(),
  sections: z.array(
    z.object({
      id: z.string(),
      heading: z.string(),
      keyPoints: z.array(z.string()).describe("What this section should cover"),
      relevantAspects: z
        .array(z.string())
        .describe("Plan aspect IDs relevant to this section"),
    }),
  ),
});

export type ReportOutline = z.infer<typeof ReportOutlineSchema>;

export const ReportSectionSchema = z.object({
  sectionMarkdown: z
    .string()
    .describe("Markdown content for this section with inline citations"),
});

export const InformationGainSchema = z.object({
  noveltyScore: z.number().min(0).max(1),
  rationale: z.string(),
  novelClaims: z
    .array(z.string())
    .describe("Claims in new findings not covered by existing"),
});

export const ContradictionCheckSchema = z.object({
  contradictions: z.array(
    z.object({
      topic: z.string(),
      claimA: z.string(),
      claimB: z.string(),
    }),
  ),
});
