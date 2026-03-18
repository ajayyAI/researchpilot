"use client";

import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ResearchForm } from "@/components/research-form";
import { ResearchProgress as ResearchProgressCard } from "@/components/research-progress";
import { ResearchReport } from "@/components/research-report";
import type { ResearchProgress } from "@/lib/research";

type ResearchState =
  | "idle"
  | "researching"
  | "generating-report"
  | "complete"
  | "error";

interface CompletedResearch {
  report: string;
  learnings: string[];
  visitedUrls: string[];
  summary: {
    totalLearnings: number;
    totalSources: number;
  };
}

export function HomePage() {
  const [query, setQuery] = useState("");
  const [breadth, setBreadth] = useState(4);
  const [depth, setDepth] = useState(2);
  const [followUpQuery, setFollowUpQuery] = useState("");

  const [state, setState] = useState<ResearchState>("idle");
  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [result, setResult] = useState<CompletedResearch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const startResearch = useCallback(
    async (searchQuery?: string) => {
      const q = searchQuery || query;
      if (!q.trim()) return;

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState("researching");
      setProgress(null);
      setProgressLog([]);
      setResult(null);
      setError(null);

      try {
        const response = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q, breadth, depth }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(
            body?.error || `Research request failed (${response.status})`,
          );
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split("\n\n");
          buffer = messages.pop() || "";

          for (const message of messages) {
            if (!message.trim()) continue;

            let eventType = "message";
            let data = "";

            for (const line of message.split("\n")) {
              if (line.startsWith("event: ")) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith("data: ")) {
                data = line.slice(6);
              }
            }

            if (!data) continue;

            try {
              const parsed = JSON.parse(data);

              switch (eventType) {
                case "progress":
                  setProgress(parsed);
                  if (parsed.currentQuery) {
                    setProgressLog((prev) => {
                      const entry = `Searching: "${parsed.currentQuery}"`;
                      if (prev[prev.length - 1] === entry) return prev;
                      return [...prev, entry];
                    });
                  }
                  if (parsed.status) {
                    setProgressLog((prev) => {
                      if (prev[prev.length - 1] === parsed.status) return prev;
                      return [...prev, parsed.status];
                    });
                  }
                  break;
                case "status":
                  if (parsed.status === "generating-report") {
                    setState("generating-report");
                    setProgressLog((prev) => [
                      ...prev,
                      "Synthesizing final report...",
                    ]);
                  }
                  break;
                case "complete":
                  setResult(parsed);
                  setState("complete");
                  break;
                case "error":
                  setError(parsed.error);
                  setState("error");
                  break;
              }
            } catch {
              // Ignore malformed SSE data
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Research failed");
        setState("error");
      }
    },
    [query, breadth, depth],
  );

  const handleFollowUp = useCallback(() => {
    if (!followUpQuery.trim()) return;
    setQuery(followUpQuery);
    setFollowUpQuery("");
    startResearch(followUpQuery);
  }, [followUpQuery, startResearch]);

  const handleNewResearch = useCallback(() => {
    abortControllerRef.current?.abort();
    setState("idle");
    setQuery("");
    setProgress(null);
    setProgressLog([]);
    setResult(null);
    setError(null);
  }, []);

  const isLoading = state === "researching" || state === "generating-report";

  return (
    <main id="main-content" className="min-h-screen pt-16">
      {state === "idle" ? (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6">
          <div className="mx-auto w-full max-w-2xl space-y-8">
            <div className="space-y-3 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
                What do you want to research?
              </h1>
              <p className="mx-auto max-w-lg text-base text-text-secondary">
                AI-powered recursive search that goes deeper than surface-level
                results.
              </p>
            </div>

            <ResearchForm
              query={query}
              onQueryChange={setQuery}
              breadth={breadth}
              onBreadthChange={setBreadth}
              depth={depth}
              onDepthChange={setDepth}
              onSubmit={() => startResearch()}
              isLoading={false}
            />
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
          {isLoading && (
            <ResearchProgressCard
              progress={progress}
              progressLog={progressLog}
              isGeneratingReport={state === "generating-report"}
              query={query}
            />
          )}

          {error && (
            <div className="rounded-xl border border-error/20 bg-error/5 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-error" />
                <div>
                  <h2 className="mb-1 text-sm font-medium text-text-primary">
                    Research Failed
                  </h2>
                  <p className="text-sm text-text-secondary">{error}</p>
                  <button
                    type="button"
                    onClick={handleNewResearch}
                    className="mt-3 text-sm text-accent underline-offset-4 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {result && state === "complete" && (
            <>
              <ResearchReport
                report={result.report}
                learningsCount={result.summary.totalLearnings}
                sourcesCount={result.summary.totalSources}
                query={query}
              />

              <div className="surface rounded-xl p-5">
                <h2 className="mb-3 text-sm font-medium text-text-secondary">
                  Follow-up research
                </h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={followUpQuery}
                    onChange={(e) => setFollowUpQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFollowUp()}
                    placeholder="Ask a follow-up question..."
                    className="flex-1 rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <button
                    type="button"
                    onClick={handleFollowUp}
                    disabled={!followUpQuery.trim()}
                    className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Research
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleNewResearch}
                  className="mt-4 text-sm text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
                >
                  Start a new report
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
