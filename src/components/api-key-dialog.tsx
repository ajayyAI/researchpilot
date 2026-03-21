"use client";

import { ExternalLink, Eye, EyeOff, Lock, Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StoredApiKeys } from "@/hooks/use-api-keys";

type Provider = StoredApiKeys["provider"];

const PROVIDERS: Array<{
  value: Provider;
  label: string;
  description: string;
  keyUrl: string;
  keyPlaceholder: string;
}> = [
  {
    value: "openrouter",
    label: "OpenRouter",
    description: "Free & paid models",
    keyUrl: "https://openrouter.ai/keys",
    keyPlaceholder: "sk-or-v1-...",
  },
  {
    value: "openai",
    label: "OpenAI",
    description: "GPT-4.1 & o4",
    keyUrl: "https://platform.openai.com/api-keys",
    keyPlaceholder: "sk-...",
  },
  {
    value: "groq",
    label: "Groq",
    description: "Llama models",
    keyUrl: "https://console.groq.com",
    keyPlaceholder: "gsk_...",
  },
];

const FIRECRAWL_URL = "https://firecrawl.dev";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialKeys: StoredApiKeys | null;
  onSave: (keys: StoredApiKeys) => void;
  mode: "setup" | "settings";
  errorMessage?: string | null;
}

export function ApiKeyDialog({
  open,
  onOpenChange,
  initialKeys,
  onSave,
  mode,
  errorMessage,
}: ApiKeyDialogProps) {
  const [provider, setProvider] = useState<Provider>(
    initialKeys?.provider ?? "openrouter",
  );
  const [providerKey, setProviderKey] = useState(
    initialKeys?.providerKey ?? "",
  );
  const [firecrawlKey, setFirecrawlKey] = useState(
    initialKeys?.firecrawlKey ?? "",
  );
  const [tavilyKey, setTavilyKey] = useState(initialKeys?.tavilyKey ?? "");
  const [showProviderKey, setShowProviderKey] = useState(false);
  const [showFirecrawlKey, setShowFirecrawlKey] = useState(false);
  const [showTavilyKey, setShowTavilyKey] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(initialKeys?.tavilyKey),
  );

  useEffect(() => {
    if (open && initialKeys) {
      setProvider(initialKeys.provider);
      setProviderKey(initialKeys.providerKey);
      setFirecrawlKey(initialKeys.firecrawlKey);
      setTavilyKey(initialKeys.tavilyKey ?? "");
      setShowAdvanced(Boolean(initialKeys.tavilyKey));
    }
  }, [open, initialKeys]);

  const isValid =
    providerKey.trim().length > 0 && firecrawlKey.trim().length > 0;

  const handleSave = useCallback(() => {
    if (!isValid) return;
    onSave({
      provider,
      providerKey: providerKey.trim(),
      firecrawlKey: firecrawlKey.trim(),
      tavilyKey: tavilyKey.trim() || undefined,
    });
  }, [provider, providerKey, firecrawlKey, tavilyKey, isValid, onSave]);

  const selectedProvider =
    PROVIDERS.find((p) => p.value === provider) ?? PROVIDERS[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="size-5 text-accent" />
            {mode === "setup" ? "Connect your API keys" : "API Key Settings"}
          </DialogTitle>
          <DialogDescription>
            {mode === "setup"
              ? "Add your keys to start researching. They never leave your browser."
              : "Manage your API keys. Changes apply to the next research session."}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
            {errorMessage}
          </div>
        )}

        <div className="mt-4 space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-text-primary">
              AI Provider
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    if (p.value !== provider) {
                      setProvider(p.value);
                      setProviderKey("");
                      setShowProviderKey(false);
                    }
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                    provider === p.value
                      ? "border-accent/40 bg-accent/10 ring-1 ring-accent/20"
                      : "border-border bg-bg-elevated/50 hover:border-border-active hover:bg-bg-elevated"
                  }`}
                >
                  <span
                    className={`block text-sm font-medium ${provider === p.value ? "text-accent" : "text-text-primary"}`}
                  >
                    {p.label}
                  </span>
                  <span className="block text-[11px] text-text-muted">
                    {p.description}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <KeyInput
            label={`${selectedProvider.label} API Key`}
            value={providerKey}
            onChange={setProviderKey}
            placeholder={selectedProvider.keyPlaceholder}
            show={showProviderKey}
            onToggleShow={() => setShowProviderKey(!showProviderKey)}
            keyUrl={selectedProvider.keyUrl}
            required
          />

          <KeyInput
            label="Firecrawl API Key"
            value={firecrawlKey}
            onChange={setFirecrawlKey}
            placeholder="fc-..."
            show={showFirecrawlKey}
            onToggleShow={() => setShowFirecrawlKey(!showFirecrawlKey)}
            keyUrl={FIRECRAWL_URL}
            required
          />

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-text-muted transition-colors hover:text-text-secondary"
            >
              {showAdvanced ? "Hide" : "Show"} optional keys
            </button>

            {showAdvanced && (
              <div className="mt-3">
                <KeyInput
                  label="Tavily API Key"
                  value={tavilyKey}
                  onChange={setTavilyKey}
                  placeholder="tvly-..."
                  show={showTavilyKey}
                  onToggleShow={() => setShowTavilyKey(!showTavilyKey)}
                  keyUrl="https://tavily.com"
                  hint="Adds a second search source for better results"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-bg-elevated/50 px-3 py-2.5">
            <Lock className="size-3.5 shrink-0 text-text-muted" />
            <p className="text-xs leading-relaxed text-text-muted">
              Keys are stored locally in your browser and sent over HTTPS. They
              are never saved on the server.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="w-full"
            size="lg"
          >
            {mode === "setup" ? "Save & Start Research" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function KeyInput({
  label,
  value,
  onChange,
  placeholder,
  show,
  onToggleShow,
  keyUrl,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  show: boolean;
  onToggleShow: () => void;
  keyUrl: string;
  required?: boolean;
  hint?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
          {required && <span className="ml-1 text-accent">*</span>}
        </label>
        <a
          href={keyUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[11px] text-text-muted transition-colors hover:text-accent"
        >
          Get key
          <ExternalLink className="size-3" />
        </a>
      </div>
      {hint && <p className="mb-1.5 text-[11px] text-text-muted">{hint}</p>}
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-xl border border-border bg-bg-elevated/50 py-2.5 pl-4 pr-10 text-sm text-text-primary placeholder:text-text-muted transition-all focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={onToggleShow}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-secondary"
            tabIndex={-1}
            aria-label={show ? "Hide key" : "Show key"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
