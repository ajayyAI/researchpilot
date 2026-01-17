/**
 * Deep Research Engine
 *
 * A recursive research engine that performs iterative deep research
 * on any topic using web search and AI-powered analysis.
 */

// Core engine functions
export { deepResearch, generateReport } from "./engine";

// Feedback generation
export { generateFeedback } from "./feedback";
// AI provider
export { getModel, getModelId } from "./providers";
// Search utilities
export { createRateLimiter, searchWeb, searchWebBatch } from "./search";
// Text utilities
export { countTokens, trimPrompt } from "./text-utils";

// Types
export type {
  ResearchConfig,
  ResearchProgress,
  ResearchResult,
  SearchResponse,
  SearchResult,
  SerpQuery,
} from "./types";
