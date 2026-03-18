"use client";

import { AlertCircle, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ResearchForm } from "@/components/research-form";
import { ResearchPlan as ResearchPlanCard } from "@/components/research-plan";
import { ResearchProgress as ResearchProgressCard } from "@/components/research-progress";
import { ResearchReport } from "@/components/research-report";
import type {
  EffortLevel,
  ResearchPlan,
  ResearchProgress,
} from "@/lib/research";

type Phase =
  | "idle"
  | "planning"
  | "researching"
  | "generating-report"
  | "complete"
  | "error";

interface CompletedResearch {
  report: string;
  summary: {
    totalFindings: number;
    totalSources: number;
    coverageMap?: Record<string, string>;
  };
}

export function HomePage() {
  const [query, setQuery] = useState("");
  const [effort, setEffort] = useState<EffortLevel>("thorough");
  const [followUpQuery, setFollowUpQuery] = useState("");

  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [plan, setPlan] = useState<ResearchPlan | null>(null);
  const [result, setResult] = useState<CompletedResearch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const resetState = useCallback(() => {
    setProgress(null);
    setProgressLog([]);
    setPlan(null);
    setResult(null);
    setError(null);
  }, []);

  const startResearch = useCallback(
    async (searchQuery?: string) => {
      const q = searchQuery || query;
      if (!q.trim()) return;

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setPhase("researching");
      resetState();

      try {
        const response = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q, effort }),
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
            const dataLines: string[] = [];

            for (const line of message.split("\n")) {
              if (line.startsWith("event: ")) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith("data: ")) {
                dataLines.push(line.slice(6));
              }
            }

            const data = dataLines.join("\n");
            if (!data) continue;

            try {
              const parsed = JSON.parse(data);

              switch (eventType) {
                case "plan":
                  setPlan(parsed.plan);
                  break;
                case "progress":
                  setProgress(parsed);
                  if (parsed.status) {
                    setProgressLog((prev) => {
                      if (prev[prev.length - 1] === parsed.status) return prev;
                      return [...prev, parsed.status];
                    });
                  }
                  break;
                case "status":
                  if (parsed.status === "planning") setPhase("planning");
                  else if (parsed.status === "researching")
                    setPhase("researching");
                  else if (parsed.status === "generating-report")
                    setPhase("generating-report");
                  if (parsed.message) {
                    setProgressLog((prev) => [...prev, parsed.message]);
                  }
                  break;
                case "aspect-complete":
                  setProgressLog((prev) => [
                    ...prev,
                    `Completed: ${parsed.aspectId} (${parsed.findingsCount} findings, ${parsed.sourcesCount} sources)`,
                  ]);
                  break;
                case "report-outline":
                  setProgressLog((prev) => [
                    ...prev,
                    `Report outline: ${parsed.sections?.length ?? 0} sections`,
                  ]);
                  break;
                case "report-section":
                  setProgressLog((prev) => [
                    ...prev,
                    `Section written: ${parsed.sectionId}`,
                  ]);
                  break;
                case "complete":
                  setResult(parsed);
                  setPhase("complete");
                  break;
                case "error":
                  setError(parsed.error);
                  setPhase("error");
                  break;
              }
            } catch {
              // Ignore malformed SSE data
            }
          }
        }

        // Flush remaining decoder bytes
        buffer += decoder.decode();
        // If stream ended without a terminal event, surface the error
        // (phase is still set from above — check via a ref-like read)
        setPhase((current) => {
          if (current !== "complete" && current !== "error") {
            setError("Research stream ended unexpectedly. Please try again.");
            return "error";
          }
          return current;
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Research failed");
        setPhase("error");
      }
    },
    [query, effort, resetState],
  );

  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setPhase("idle");
    resetState();
  }, [resetState]);

  const handleFollowUp = useCallback(() => {
    if (!followUpQuery.trim()) return;
    const q = followUpQuery;
    setQuery(q);
    setFollowUpQuery("");
    startResearch(q);
  }, [followUpQuery, startResearch]);

  const handleNewResearch = useCallback(() => {
    abortControllerRef.current?.abort();
    setPhase("idle");
    setQuery("");
    setFollowUpQuery("");
    resetState();
  }, [resetState]);

  const isLoading =
    phase === "planning" ||
    phase === "researching" ||
    phase === "generating-report";

  return (
    <main id="main-content" className="min-h-screen pt-16">
      {phase === "idle" ? (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6">
          <div className="mx-auto w-full max-w-2xl space-y-8">
            <div className="space-y-3 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
                What do you want to research?
              </h1>
              <p className="mx-auto max-w-lg text-base text-text-secondary">
                Deep, multi-source research on any topic — with structured
                plans, credibility scoring, and detailed reports.
              </p>
            </div>

            <ResearchForm
              query={query}
              onQueryChange={setQuery}
              effort={effort}
              onEffortChange={setEffort}
              onSubmit={() => startResearch()}
              isLoading={false}
            />
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
          {plan && <ResearchPlanCard plan={plan} isActive={isLoading} />}

          {isLoading && (
            <>
              <ResearchProgressCard
                progress={progress}
                progressLog={progressLog}
                isGeneratingReport={phase === "generating-report"}
                query={query}
              />

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
                >
                  <Square className="size-3.5" />
                  <span>Stop research</span>
                </button>
              </div>
            </>
          )}

          {error && (
            <div
              className="rounded-xl border border-error/20 bg-error/5 p-5"
              role="alert"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="mt-0.5 size-5 shrink-0 text-error"
                  aria-hidden="true"
                />
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

          {result && phase === "complete" && (
            <>
              <ResearchReport
                report={result.report}
                findingsCount={result.summary.totalFindings}
                sourcesCount={result.summary.totalSources}
                query={query}
              />

              <div className="surface rounded-xl p-5">
                <h2 className="mb-3 text-sm font-medium text-text-secondary">
                  Follow-up research
                </h2>
                <div className="flex gap-3">
                  <label htmlFor="follow-up-input" className="sr-only">
                    Follow-up question
                  </label>
                  <input
                    id="follow-up-input"
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
