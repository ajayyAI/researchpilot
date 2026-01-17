import { generateText, Output } from "ai";
import pLimit from "p-limit";

import { getModel } from "./providers";
import {
  getLearningsPrompt,
  getReportPrompt,
  getSerpQueryPrompt,
  getSystemPrompt,
} from "./prompts";
import { searchWeb, getConcurrencyLimit } from "./search";
import { trimPrompt } from "./text-utils";
import {
  type ResearchProgress,
  type ResearchResult,
  type SerpQuery,
  SerpQueriesSchema,
  LearningsSchema,
  ReportSchema,
} from "./types";

/**
 * Deep Research Engine
 *
 * Performs iterative, recursive research on any topic by:
 * 1. Generating SERP queries based on the research goal
 * 2. Searching the web and extracting content
 * 3. Processing results to extract key learnings
 * 4. Recursively exploring follow-up questions at deeper levels
 * 5. Compiling all learnings into a comprehensive report
 */

// ============================================
// Query Generation
// ============================================

/**
 * Generate SERP queries from user input and previous learnings.
 */
async function generateSerpQueries(
  query: string,
  numQueries: number,
  learnings?: string[],
): Promise<SerpQuery[]> {
  const { output } = await generateText({
    model: getModel(),
    system: getSystemPrompt(),
    prompt: getSerpQueryPrompt(query, numQueries, learnings),
    output: Output.object({
      schema: SerpQueriesSchema,
    }),
  });

  if (!output) {
    console.error("Failed to generate SERP queries");
    return [];
  }

  console.log(`Generated ${output.queries.length} SERP queries`);
  return output.queries.slice(0, numQueries);
}

// ============================================
// Result Processing
// ============================================

/**
 * Process search results to extract learnings and follow-up questions.
 */
async function processSearchResults(
  query: string,
  contents: string[],
  numLearnings = 3,
  numFollowUpQuestions = 3,
): Promise<{ learnings: string[]; followUpQuestions: string[] }> {
  if (contents.length === 0) {
    return { learnings: [], followUpQuestions: [] };
  }

  // Trim each content to prevent context overflow
  const trimmedContents = contents.map((c) => trimPrompt(c, 25_000));

  const { output } = await generateText({
    model: getModel(),
    system: getSystemPrompt(),
    prompt: getLearningsPrompt(
      query,
      trimmedContents,
      numLearnings,
      numFollowUpQuestions,
    ),
    output: Output.object({
      schema: LearningsSchema,
    }),
    abortSignal: AbortSignal.timeout(60_000),
  });

  if (!output) {
    console.error("Failed to process search results");
    return { learnings: [], followUpQuestions: [] };
  }

  console.log(`Extracted ${output.learnings.length} learnings from "${query}"`);
  return output;
}

// ============================================
// Main Research Algorithm
// ============================================

/**
 * Perform deep, recursive research on a topic.
 *
 * @param config - Research configuration
 * @param config.query - The research query
 * @param config.breadth - Number of parallel queries per level
 * @param config.depth - Number of recursive levels
 * @param config.learnings - Accumulated learnings (internal use)
 * @param config.visitedUrls - Visited URLs (internal use)
 * @param config.onProgress - Progress callback for real-time updates
 * @returns Research results with learnings and visited URLs
 */
export async function deepResearch({
  query,
  breadth,
  depth,
  learnings = [],
  visitedUrls = [],
  onProgress,
}: {
  query: string;
  breadth: number;
  depth: number;
  learnings?: string[];
  visitedUrls?: string[];
  onProgress?: (progress: ResearchProgress) => void;
}): Promise<ResearchResult> {
  // Initialize progress tracking
  const progress: ResearchProgress = {
    currentDepth: depth,
    totalDepth: depth,
    currentBreadth: breadth,
    totalBreadth: breadth,
    totalQueries: 0,
    completedQueries: 0,
  };

  const reportProgress = (update: Partial<ResearchProgress>) => {
    Object.assign(progress, update);
    onProgress?.(progress);
  };

  // Generate SERP queries for this level
  const serpQueries = await generateSerpQueries(query, breadth, learnings);

  reportProgress({
    totalQueries: serpQueries.length,
    currentQuery: serpQueries[0]?.query,
    status: `Researching: ${serpQueries[0]?.query || query}`,
  });

  // Process queries with rate limiting
  const limit = pLimit(getConcurrencyLimit());

  const results = await Promise.all(
    serpQueries.map((serpQuery) =>
      limit(async () => {
        try {
          // Search the web
          const searchResults = await searchWeb(serpQuery.query, {
            limit: 5,
            timeout: 15000,
            scrapeContent: true,
          });

          // Collect URLs
          const newUrls = searchResults
            .map((r) => r.url)
            .filter((url) => url);

          // Extract content for processing
          const contents = searchResults
            .map((r) => r.markdown)
            .filter((c): c is string => !!c);

          console.log(
            `Search "${serpQuery.query}" returned ${contents.length} contents`,
          );

          // Calculate parameters for next level
          const newBreadth = Math.ceil(breadth / 2);
          const newDepth = depth - 1;

          // Process results to extract learnings
          const processed = await processSearchResults(
            serpQuery.query,
            contents,
            3,
            newBreadth,
          );

          const allLearnings = [...learnings, ...processed.learnings];
          const allUrls = [...visitedUrls, ...newUrls];

          // Recurse if depth > 0
          if (newDepth > 0) {
            console.log(
              `Researching deeper: breadth=${newBreadth}, depth=${newDepth}`,
            );

            reportProgress({
              currentDepth: newDepth,
              currentBreadth: newBreadth,
              completedQueries: progress.completedQueries + 1,
              currentQuery: serpQuery.query,
              status: `Going deeper: ${processed.followUpQuestions[0] || serpQuery.query}`,
            });

            // Build next query from research goal and follow-ups
            const nextQuery = `
Previous research goal: ${serpQuery.researchGoal}
Follow-up research directions: ${processed.followUpQuestions.map((q) => `\n- ${q}`).join("")}
            `.trim();

            return deepResearch({
              query: nextQuery,
              breadth: newBreadth,
              depth: newDepth,
              learnings: allLearnings,
              visitedUrls: allUrls,
              onProgress,
            });
          }

          // Base case: return accumulated results
          reportProgress({
            currentDepth: 0,
            completedQueries: progress.completedQueries + 1,
            currentQuery: serpQuery.query,
            status: "Completing research branch",
          });

          return {
            learnings: allLearnings,
            visitedUrls: allUrls,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          if (errorMessage.includes("Timeout")) {
            console.error(`Timeout for query "${serpQuery.query}"`);
          } else {
            console.error(`Error for query "${serpQuery.query}":`, errorMessage);
          }

          return {
            learnings: [],
            visitedUrls: [],
          };
        }
      }),
    ),
  );

  // Deduplicate and combine results
  return {
    learnings: [...new Set(results.flatMap((r) => r.learnings))],
    visitedUrls: [...new Set(results.flatMap((r) => r.visitedUrls))],
  };
}

// ============================================
// Report Generation
// ============================================

/**
 * Generate a comprehensive research report from accumulated learnings.
 *
 * @param query - The original research query
 * @param learnings - All learnings from the research
 * @param visitedUrls - All URLs visited during research
 * @returns Markdown-formatted research report
 */
export async function generateReport(
  query: string,
  learnings: string[],
  visitedUrls: string[],
): Promise<string> {
  const { output } = await generateText({
    model: getModel(),
    system: getSystemPrompt(),
    prompt: trimPrompt(getReportPrompt(query, learnings)),
    output: Output.object({
      schema: ReportSchema,
    }),
  });

  if (!output) {
    return "# Research Report\n\nFailed to generate report.";
  }

  // Append sources section
  const sourcesSection = `\n\n## Sources\n\n${visitedUrls.map((url) => `- ${url}`).join("\n")}`;

  return output.reportMarkdown + sourcesSection;
}
