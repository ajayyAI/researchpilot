import Firecrawl, { type SearchData } from "@mendable/firecrawl-js";
import pLimit from "p-limit";

import type { SearchResult } from "./types";

/**
 * Web search integration using Firecrawl API.
 * Handles search queries with rate limiting and result normalization.
 */

// Lazy initialization of Firecrawl client to avoid requiring API key at build time
let firecrawlClient: Firecrawl | null = null;

function getFirecrawl(): Firecrawl {
  if (!firecrawlClient) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error("FIRECRAWL_API_KEY environment variable is required");
    }
    firecrawlClient = new Firecrawl({ apiKey });
  }
  return firecrawlClient;
}

// Concurrency limit for API calls
const concurrencyLimit = Number(process.env.FIRECRAWL_CONCURRENCY) || 2;
const limit = pLimit(concurrencyLimit);

/**
 * Sleep for a specified duration.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Search the web using Firecrawl API with automatic retry on rate limits.
 *
 * @param query - The search query
 * @param options - Search options
 * @returns Normalized search results
 */
export async function searchWeb(
  query: string,
  options: {
    limit?: number;
    timeout?: number;
    scrapeContent?: boolean;
  } = {},
): Promise<SearchResult[]> {
  const {
    limit: resultLimit = 5,
    timeout = 15000,
    scrapeContent = true,
  } = options;

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response: SearchData = await getFirecrawl().search(query, {
        limit: resultLimit,
        timeout,
        scrapeOptions: scrapeContent ? { formats: ["markdown"] } : undefined,
      });

      // Firecrawl v4 returns { web: [...], news: [...], images: [...] }
      const webResults = response.web || [];

      // Normalize results to our SearchResult type
      // Handle union of SearchResultWeb | Document by checking for properties
      return webResults.map((item) => {
        // Type guard: SearchResultWeb has url, Document has sourceUrl
        const url: string =
          "url" in item && typeof item.url === "string"
            ? item.url
            : "sourceUrl" in item && typeof item.sourceUrl === "string"
              ? item.sourceUrl
              : "";
        const title = "title" in item ? item.title : undefined;
        const description =
          "description" in item ? item.description : undefined;
        const markdown = "markdown" in item ? item.markdown : undefined;

        return {
          url: url || "",
          title,
          description,
          markdown,
        };
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if it's a rate limit error (429)
      const isRateLimitError =
        error instanceof Error &&
        (error.message.includes("429") ||
          error.message.includes("Rate limit") ||
          error.message.includes("rate limit") ||
          ("status" in error && (error as { status: number }).status === 429));

      if (isRateLimitError && attempt < maxRetries - 1) {
        // Exponential backoff: 15s, 30s, 60s
        const waitTime = 15000 * 2 ** attempt;
        console.log(
          `Rate limited on "${query}", waiting ${waitTime / 1000}s before retry (attempt ${attempt + 1}/${maxRetries})`,
        );
        await sleep(waitTime);
        continue;
      }

      // Non-rate-limit error or max retries reached
      console.error(`Search error for query "${query}":`, error);
      return [];
    }
  }

  console.error(
    `Search failed after ${maxRetries} retries for "${query}":`,
    lastError,
  );
  return [];
}

/**
 * Execute multiple searches with rate limiting.
 *
 * @param queries - Array of search queries
 * @param options - Search options
 * @returns Results grouped by query
 */
export async function searchWebBatch(
  queries: string[],
  options: {
    limit?: number;
    timeout?: number;
    scrapeContent?: boolean;
  } = {},
): Promise<Map<string, SearchResult[]>> {
  const results = new Map<string, SearchResult[]>();

  await Promise.all(
    queries.map((query) =>
      limit(async () => {
        const searchResults = await searchWeb(query, options);
        results.set(query, searchResults);
      }),
    ),
  );

  return results;
}

/**
 * Get the configured concurrency limit.
 */
export function getConcurrencyLimit(): number {
  return concurrencyLimit;
}

/**
 * Create a rate limiter for custom use.
 */
export function createRateLimiter(maxConcurrent?: number) {
  return pLimit(maxConcurrent ?? concurrencyLimit);
}
