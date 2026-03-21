import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestKeys {
  provider: "openai" | "groq" | "openrouter";
  providerKey: string;
  firecrawlKey: string;
  tavilyKey?: string;
}

const storage = new AsyncLocalStorage<RequestKeys>();

export function getRequestKeys(): RequestKeys | undefined {
  return storage.getStore();
}

export function runWithKeys<T>(
  keys: RequestKeys,
  fn: () => Promise<T>,
): Promise<T> {
  return storage.run(keys, fn);
}
