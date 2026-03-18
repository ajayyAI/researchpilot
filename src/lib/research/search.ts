import Firecrawl, { type SearchData } from "@mendable/firecrawl-js";
import pLimit from "p-limit";

import type { SearchResult } from "./types";

let firecrawlClient: Firecrawl | null = null;

function getFirecrawl(): Firecrawl {
  if (!firecrawlClient) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error(
        "FIRECRAWL_API_KEY is required. Get one at https://firecrawl.dev",
      );
    }
    firecrawlClient = new Firecrawl({ apiKey });
  }
  return firecrawlClient;
}

const concurrencyLimit = Number(process.env.FIRECRAWL_CONCURRENCY) || 2;
const limit = pLimit(concurrencyLimit);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

      const webResults = response.web || [];

      return webResults.map((item) => {
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

      const isRateLimitError =
        error instanceof Error &&
        (error.message.includes("429") ||
          error.message.includes("Rate limit") ||
          error.message.includes("rate limit") ||
          ("status" in error && (error as { status: number }).status === 429));

      if (isRateLimitError && attempt < maxRetries - 1) {
        const waitTime = 15000 * 2 ** attempt;
        console.log(
          `Rate limited on "${query}", waiting ${waitTime / 1000}s before retry (attempt ${attempt + 1}/${maxRetries})`,
        );
        await sleep(waitTime);
        continue;
      }

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

export function getConcurrencyLimit(): number {
  return concurrencyLimit;
}

export function createRateLimiter(maxConcurrent?: number) {
  return pLimit(maxConcurrent ?? concurrencyLimit);
}
