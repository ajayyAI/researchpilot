import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";

/**
 * AI Provider configuration for the research engine.
 * Supports multiple providers:
 * - openai: OpenAI (requires paid API key)
 * - groq: Groq (free tier, but limited token limits)
 * - openrouter: OpenRouter (30+ free models, recommended for hobby projects)
 */

type Provider = "openai" | "groq" | "openrouter";

// Create OpenAI client
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create Groq client (free tier available, no credit card required)
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Create OpenRouter client (access to 30+ free models)
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Default models for each provider
// Note: Models must support structured outputs (JSON schema)
const DEFAULT_MODELS: Record<Provider, string> = {
  openai: "gpt-4o",
  groq: "meta-llama/llama-4-scout-17b-16e-instruct",
  openrouter: "meta-llama/llama-3.3-70b-instruct:free",
};

/**
 * Get the configured language model for research operations.
 * Uses AI_PROVIDER env var to select provider (default: openai).
 * Uses AI_MODEL env var for model ID or provider-specific default.
 */
export function getModel(): LanguageModel {
  const provider = (process.env.AI_PROVIDER || "openai") as Provider;
  const modelId = process.env.AI_MODEL || DEFAULT_MODELS[provider];

  if (provider === "groq") {
    return groq(modelId);
  }

  if (provider === "openrouter") {
    return openrouter(modelId);
  }

  return openai(modelId);
}

/**
 * Get model ID for logging purposes.
 */
export function getModelId(): string {
  const provider = (process.env.AI_PROVIDER || "openai") as Provider;
  return process.env.AI_MODEL || DEFAULT_MODELS[provider];
}

/**
 * Get the current provider name for logging.
 */
export function getProviderName(): string {
  return process.env.AI_PROVIDER || "openai";
}
