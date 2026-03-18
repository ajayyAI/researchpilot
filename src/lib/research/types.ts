import { z } from "zod";

export interface ResearchProgress {
  currentDepth: number;
  totalDepth: number;
  currentBreadth: number;
  totalBreadth: number;
  currentQuery?: string;
  totalQueries: number;
  completedQueries: number;
  status?: string;
}

export interface ResearchResult {
  learnings: string[];
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

export const ReportSchema = z.object({
  reportMarkdown: z
    .string()
    .describe(
      "Comprehensive research report in Markdown format with all learnings synthesized.",
    ),
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
