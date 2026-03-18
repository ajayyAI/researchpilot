import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";

export type ModelTier = "fast" | "smart" | "strategic";

type Provider = "openai" | "groq" | "openrouter";

const VALID_PROVIDERS = new Set<string>(["openai", "groq", "openrouter"]);

const DEFAULT_MODELS: Record<Provider, string> = {
  openai: "gpt-4.1",
  groq: "meta-llama/llama-4-scout-17b-16e-instruct",
  openrouter: "google/gemini-2.5-flash:free",
};

const TIER_ENV_VARS: Record<ModelTier, string> = {
  fast: "AI_MODEL_FAST",
  smart: "AI_MODEL",
  strategic: "AI_MODEL_STRATEGIC",
};

let _openai: ReturnType<typeof createOpenAI> | null = null;
let _groq: ReturnType<typeof createGroq> | null = null;
let _openrouter: ReturnType<typeof createOpenRouter> | null = null;

function getOpenAI() {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is required when AI_PROVIDER=openai. Get one at https://platform.openai.com/api-keys",
      );
    }
    _openai = createOpenAI({ apiKey });
  }
  return _openai;
}

function getGroq() {
  if (!_groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY is required when AI_PROVIDER=groq. Get one at https://console.groq.com",
      );
    }
    _groq = createGroq({ apiKey });
  }
  return _groq;
}

function getOpenRouter() {
  if (!_openrouter) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is required when AI_PROVIDER=openrouter. Get one at https://openrouter.ai/keys",
      );
    }
    _openrouter = createOpenRouter({ apiKey });
  }
  return _openrouter;
}

function getProvider(): Provider {
  const raw = process.env.AI_PROVIDER || "openai";
  if (!VALID_PROVIDERS.has(raw)) {
    throw new Error(
      `Invalid AI_PROVIDER "${raw}". Must be one of: openai, groq, openrouter`,
    );
  }
  return raw as Provider;
}

function getModelIdForTier(tier: ModelTier, provider: Provider): string {
  const tierEnvVar = TIER_ENV_VARS[tier];
  const tierModel = process.env[tierEnvVar];

  if (tierModel) return tierModel;

  // For non-smart tiers, fall back to AI_MODEL before the provider default
  if (tier !== "smart" && process.env.AI_MODEL) {
    return process.env.AI_MODEL;
  }

  return DEFAULT_MODELS[provider];
}

export function getModel(tier?: ModelTier): LanguageModel {
  const provider = getProvider();
  const modelId = getModelIdForTier(tier ?? "smart", provider);

  switch (provider) {
    case "groq":
      return getGroq()(modelId);
    case "openrouter":
      return getOpenRouter()(modelId);
    default:
      return getOpenAI()(modelId);
  }
}
