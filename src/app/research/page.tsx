"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { ResearchForm } from "@/components/research-form";
import { ResearchProgress as ResearchProgressCard } from "@/components/research-progress";
import { ResearchReport } from "@/components/research-report";
import { Button } from "@/components/ui/button";
import type { ResearchProgress } from "@/lib/research";

type ResearchState =
  | "idle"
  | "researching"
  | "generating-report"
  | "complete"
  | "error";

interface ResearchResult {
  report: string;
  learnings: string[];
  visitedUrls: string[];
  summary: {
    totalLearnings: number;
    totalSources: number;
  };
}

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [breadth, setBreadth] = useState(4);
  const [depth, setDepth] = useState(2);

  const [state, setState] = useState<ResearchState>("idle");
  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startResearch = useCallback(async () => {
    if (!query.trim()) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState("researching");
    setProgress(null);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, breadth, depth }),
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
                break;
              case "status":
                if (parsed.status === "generating-report") {
                  setState("generating-report");
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
            console.warn("Failed to parse SSE data:", data);
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Research failed");
      setState("error");
    }
  }, [query, breadth, depth]);

  const isLoading = state === "researching" || state === "generating-report";
  const loadingText =
    state === "generating-report" ? "Generating Report..." : "Researching...";

  return (
    <main className="min-h-screen">
      <section className="section py-12 md:py-16">
        <div className="container-width">
          <div className="max-w-4xl mx-auto mb-10">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="mb-8 hover:bg-white/5 text-text-secondary hover:text-white -ml-4"
            >
              <Link href="/">
                <ArrowLeft className="size-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            <div className="mb-12 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">
                New Research Session
              </h1>
              <p className="text-xl text-text-secondary leading-relaxed max-w-2xl">
                Configure your research parameters below. The AI will
                recursively explore the topic to find deep insights.
              </p>
            </div>

            <div className="space-y-12">
              <ResearchForm
                query={query}
                onQueryChange={setQuery}
                breadth={breadth}
                onBreadthChange={setBreadth}
                depth={depth}
                onDepthChange={setDepth}
                onSubmit={startResearch}
                isLoading={isLoading}
                loadingText={loadingText}
              />

              {progress && isLoading && (
                <ResearchProgressCard
                  progress={progress}
                  isGeneratingReport={state === "generating-report"}
                />
              )}

              {error && (
                <div className="card rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-red-200 mb-1">
                        Error Occurred
                      </h3>
                      <p className="text-sm text-red-300/80">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {result && state === "complete" && (
                <ResearchReport
                  report={result.report}
                  learningsCount={result.summary.totalLearnings}
                  sourcesCount={result.summary.totalSources}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
