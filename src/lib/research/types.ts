import { z } from "zod";

export interface ResearchConfig {
  /** The user's research query */
  query: string;
  /** Number of parallel SERP queries per level (default: 4) */
  breadth: number;
  /** Number of recursive research levels (default: 2) */
  depth: number;
  /** Combined query including follow-up answers */
  combinedQuery?: string;
}

export interface ResearchProgress {
  /** Current depth level (counts down from initial) */
  currentDepth: number;
  /** Initial depth setting */
  totalDepth: number;
  /** Current breadth setting */
  currentBreadth: number;
  /** Initial breadth setting */
  totalBreadth: number;
  /** Currently executing query */
  currentQuery?: string;
  /** Total number of queries to execute */
  totalQueries: number;
  /** Number of completed queries */
  completedQueries: number;
  /** Current status message */
  status?: string;
}

export interface ResearchResult {
  /** Accumulated learnings from all searches */
  learnings: string[];
  /** All URLs visited during research */
  visitedUrls: string[];
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

export type SerpQuery = z.infer<typeof SerpQuerySchema>;
export type SerpQueries = z.infer<typeof SerpQueriesSchema>;

export const LearningsSchema = z.object({
  learnings: z
    .array(z.string())
    .describe(
      "Key learnings extracted from search results. Each should be unique, detailed, and include specific entities, metrics, and dates.",
    ),
  followUpQuestions: z
    .array(z.string())
    .describe("Follow-up questions to research the topic further"),
});

export type Learnings = z.infer<typeof LearningsSchema>;

export const ReportSchema = z.object({
  reportMarkdown: z
    .string()
    .describe(
      "Comprehensive research report in Markdown format with all learnings synthesized.",
    ),
});

export type Report = z.infer<typeof ReportSchema>;

export const FeedbackSchema = z.object({
  questions: z
    .array(z.string())
    .describe(
      "Follow-up questions to clarify research direction before starting",
    ),
});

export type Feedback = z.infer<typeof FeedbackSchema>;

export interface SearchResult {
  url: string;
  title?: string;
  description?: string;
  markdown?: string;
}

export interface SearchResponse {
  success: boolean;
  data: SearchResult[];
}
