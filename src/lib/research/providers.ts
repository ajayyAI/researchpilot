import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";

export type ModelTier = "fast" | "smart" | "strategic";
type Provider = "openai" | "groq" | "openrouter";

const DEFAULT_MODELS: Record<Provider, Record<ModelTier, string>> = {
  openai: {
    fast: "gpt-4.1-mini",
    smart: "gpt-4.1",
    strategic: "o4-mini",
  },
  groq: {
    fast: "meta-llama/llama-4-scout-17b-16e-instruct",
    smart: "meta-llama/llama-4-scout-17b-16e-instruct",
    strategic: "meta-llama/llama-4-scout-17b-16e-instruct",
  },
  openrouter: {
    fast: "mistralai/mistral-small-3.1-24b-instruct:free",
    smart: "meta-llama/llama-3.3-70b-instruct:free",
    strategic: "meta-llama/llama-3.3-70b-instruct:free",
  },
};

const TIER_ENV_VARS: Record<ModelTier, string> = {
  fast: "AI_MODEL_FAST",
  smart: "AI_MODEL",
  strategic: "AI_MODEL_STRATEGIC",
};

const VALID_PROVIDERS = new Set<string>(["openai", "groq", "openrouter"]);

const API_KEY_CONFIG: Record<
  Provider,
  { env: string; label: string; url: string }
> = {
  openai: {
    env: "OPENAI_API_KEY",
    label: "OPENAI_API_KEY",
    url: "https://platform.openai.com/api-keys",
  },
  groq: {
    env: "GROQ_API_KEY",
    label: "GROQ_API_KEY",
    url: "https://console.groq.com",
  },
  openrouter: {
    env: "OPENROUTER_API_KEY",
    label: "OPENROUTER_API_KEY",
    url: "https://openrouter.ai/keys",
  },
};

const providerCache = new Map<Provider, ReturnType<typeof createOpenAI>>();

function getProviderClient(provider: Provider) {
  const cached = providerCache.get(provider);
  if (cached) return cached;

  const { env, label, url } = API_KEY_CONFIG[provider];
  const apiKey = process.env[env];
  if (!apiKey) {
    throw new Error(
      `${label} is required when AI_PROVIDER=${provider}. Get one at ${url}`,
    );
  }

  const factory = {
    openai: createOpenAI,
    groq: createGroq,
    openrouter: createOpenRouter,
  };
  const client = factory[provider]({ apiKey });
  providerCache.set(provider, client as ReturnType<typeof createOpenAI>);
  return client;
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
  const tierModel = process.env[TIER_ENV_VARS[tier]];
  if (tierModel) return tierModel;

  if (tier !== "smart" && process.env.AI_MODEL) {
    return process.env.AI_MODEL;
  }

  return DEFAULT_MODELS[provider][tier];
}

export function getModel(tier?: ModelTier): LanguageModel {
  const provider = getProvider();
  const modelId = getModelIdForTier(tier ?? "smart", provider);
  return getProviderClient(provider)(modelId) as LanguageModel;
}
