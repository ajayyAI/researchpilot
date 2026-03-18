import { generateText, Output } from "ai";
import pLimit from "p-limit";
import {
  getLearningsPrompt,
  getReportPrompt,
  getSerpQueryPrompt,
  getSystemPrompt,
} from "./prompts";
import { getModel } from "./providers";
import { getConcurrencyLimit, searchWeb } from "./search";
import { trimPrompt } from "./text-utils";
import {
  LearningsSchema,
  ReportSchema,
  type ResearchProgress,
  type ResearchResult,
  SerpQueriesSchema,
  type SerpQuery,
} from "./types";

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

async function processSearchResults(
  query: string,
  contents: string[],
  numLearnings = 3,
  numFollowUpQuestions = 3,
): Promise<{ learnings: string[]; followUpQuestions: string[] }> {
  if (contents.length === 0) {
    return { learnings: [], followUpQuestions: [] };
  }

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

  const serpQueries = await generateSerpQueries(query, breadth, learnings);

  reportProgress({
    totalQueries: serpQueries.length,
    currentQuery: serpQueries[0]?.query,
    status: `Researching: ${serpQueries[0]?.query || query}`,
  });

  const limit = pLimit(getConcurrencyLimit());

  const results = await Promise.all(
    serpQueries.map((serpQuery) =>
      limit(async () => {
        try {
          const searchResults = await searchWeb(serpQuery.query, {
            limit: 5,
            timeout: 15000,
            scrapeContent: true,
          });

          const newUrls = searchResults.map((r) => r.url).filter((url) => url);

          const contents = searchResults
            .map((r) => r.markdown)
            .filter((c): c is string => !!c);

          console.log(
            `Search "${serpQuery.query}" returned ${contents.length} contents`,
          );

          const newBreadth = Math.ceil(breadth / 2);
          const newDepth = depth - 1;

          const processed = await processSearchResults(
            serpQuery.query,
            contents,
            3,
            newBreadth,
          );

          const allLearnings = [...learnings, ...processed.learnings];
          const allUrls = [...visitedUrls, ...newUrls];

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
            console.error(
              `Error for query "${serpQuery.query}":`,
              errorMessage,
            );
          }

          return {
            learnings: [],
            visitedUrls: [],
          };
        }
      }),
    ),
  );

  return {
    learnings: [...new Set(results.flatMap((r) => r.learnings))],
    visitedUrls: [...new Set(results.flatMap((r) => r.visitedUrls))],
  };
}

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

  const sourcesSection = `\n\n## Sources\n\n${visitedUrls.map((url) => `- ${url}`).join("\n")}`;

  return output.reportMarkdown + sourcesSection;
}
