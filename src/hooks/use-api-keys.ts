"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "researchpilot:api-keys";

export interface StoredApiKeys {
  provider: "openai" | "groq" | "openrouter";
  providerKey: string;
  firecrawlKey: string;
  tavilyKey?: string;
}

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

export function useApiKeys() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const keys: StoredApiKeys | null = raw ? parseKeys(raw) : null;

  const saveKeys = useCallback((newKeys: StoredApiKeys) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newKeys));
      emitChange();
    } catch {
      // localStorage unavailable
    }
  }, []);

  const clearKeys = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      emitChange();
    } catch {
      // localStorage unavailable
    }
  }, []);

  return {
    keys,
    hasKeys: keys !== null,
    saveKeys,
    clearKeys,
  };
}

const VALID_PROVIDERS = new Set<string>(["openai", "groq", "openrouter"]);

function parseKeys(raw: string): StoredApiKeys | null {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.provider === "string" &&
      VALID_PROVIDERS.has(parsed.provider) &&
      typeof parsed.providerKey === "string" &&
      parsed.providerKey.length > 0 &&
      typeof parsed.firecrawlKey === "string" &&
      parsed.firecrawlKey.length > 0
    ) {
      return parsed as StoredApiKeys;
    }
    return null;
  } catch {
    return null;
  }
}
