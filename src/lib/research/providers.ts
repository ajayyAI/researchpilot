import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

/**
 * AI Provider configuration for the research engine.
 * Uses AI SDK v6 with OpenAI as the default provider.
 */

// Create OpenAI client with environment configuration
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get the configured language model for research operations.
 * Uses environment variable AI_MODEL or defaults to gpt-4o.
 */
export function getModel(): LanguageModel {
  const modelId = process.env.AI_MODEL || "gpt-4o";
  return openai(modelId);
}

/**
 * Get model ID for logging purposes.
 */
export function getModelId(): string {
  return process.env.AI_MODEL || "gpt-4o";
}
