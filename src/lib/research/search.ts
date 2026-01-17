import Firecrawl, { type SearchData } from "@mendable/firecrawl-js";
import pLimit from "p-limit";

import type { SearchResult } from "./types";

/**
 * Web search integration using Firecrawl API.
 * Handles search queries with rate limiting and result normalization.
 */

// Initialize Firecrawl client
const firecrawl = new Firecrawl({
	apiKey: process.env.FIRECRAWL_API_KEY ?? "",
});

// Concurrency limit for API calls
const concurrencyLimit = Number(process.env.FIRECRAWL_CONCURRENCY) || 2;
const limit = pLimit(concurrencyLimit);

/**
 * Search the web using Firecrawl API.
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
	const { limit: resultLimit = 5, timeout = 15000, scrapeContent = true } = options;

	try {
		const response: SearchData = await firecrawl.search(query, {
			limit: resultLimit,
			timeout,
			scrapeOptions: scrapeContent
				? { formats: ["markdown"] }
				: undefined,
		});

		// Firecrawl v4 returns { web: [...], news: [...], images: [...] }
		const webResults = response.web || [];

		// Normalize results to our SearchResult type
		// Handle union of SearchResultWeb | Document by checking for properties
		return webResults.map((item) => {
			// Type guard: SearchResultWeb has url, Document has sourceUrl
			const url: string = "url" in item && typeof item.url === "string" 
				? item.url 
				: ("sourceUrl" in item && typeof item.sourceUrl === "string" ? item.sourceUrl : "");
			const title = "title" in item ? item.title : undefined;
			const description = "description" in item ? item.description : undefined;
			const markdown = "markdown" in item ? item.markdown : undefined;
			
			return {
				url: url || "",
				title,
				description,
				markdown,
			};
		});
	} catch (error) {
		console.error(`Search error for query "${query}":`, error);
		return [];
	}
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
