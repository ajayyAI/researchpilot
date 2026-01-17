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

// Search utilities
export { searchWeb, searchWebBatch, createRateLimiter } from "./search";

// Text utilities
export { trimPrompt, countTokens } from "./text-utils";

// AI provider
export { getModel, getModelId } from "./providers";

// Types
export type {
  ResearchConfig,
  ResearchProgress,
  ResearchResult,
  SerpQuery,
  SearchResult,
  SearchResponse,
} from "./types";
