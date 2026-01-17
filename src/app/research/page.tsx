"use client";

import { useState, useCallback } from "react";
import type { ResearchProgress } from "@/lib/research";

// Research components
import { ResearchForm } from "@/components/research-form";
import { ResearchProgress as ResearchProgressCard } from "@/components/research-progress";
import { ResearchReport } from "@/components/research-report";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  // Form state
  const [query, setQuery] = useState("");
  const [breadth, setBreadth] = useState(4);
  const [depth, setDepth] = useState(2);

  // Research state
  const [state, setState] = useState<ResearchState>("idle");
  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startResearch = useCallback(async () => {
    if (!query.trim()) return;

    setState("researching");
    setProgress(null);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, breadth, depth }),
      });

      if (!response.ok) {
        throw new Error("Research request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            const eventType = line.slice(7);
            const dataLineIndex = lines.indexOf(line) + 1;
            const dataLine = lines[dataLineIndex];

            if (dataLine?.startsWith("data: ")) {
              const data = JSON.parse(dataLine.slice(6));

              switch (eventType) {
                case "progress":
                  setProgress(data);
                  break;
                case "status":
                  if (data.status === "generating-report") {
                    setState("generating-report");
                  }
                  break;
                case "complete":
                  setResult(data);
                  setState("complete");
                  break;
                case "error":
                  setError(data.error);
                  setState("error");
                  break;
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed");
      setState("error");
    }
  }, [query, breadth, depth]);

  const isLoading = state === "researching" || state === "generating-report";
  const loadingText =
    state === "generating-report" ? "Generating Report..." : "Researching...";

  return (
    <main className="min-h-screen bg-bg-primary">
      <section className="section">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-6 -ml-4">
              <Link href="/">
                <ArrowLeft className="size-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            <div className="mb-12">
              <h1 className="text-h2 font-semibold mb-4">
                <span className="text-gradient-primary">
                  New Research Session
                </span>
              </h1>
              <p className="text-body-lg text-text-secondary leading-relaxed">
                Configure your research parameters below. The AI will
                recursively explore the topic to find deep insights.
              </p>
            </div>

            {/* Research Interface */}
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Form */}
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

              {/* Progress */}
              {progress && isLoading && (
                <ResearchProgressCard
                  progress={progress}
                  isGeneratingReport={state === "generating-report"}
                />
              )}

              {/* Error */}
              {error && (
                <div className="card border border-red-200 bg-red-50">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-body font-semibold text-red-900 mb-1">
                        Error
                      </h3>
                      <p className="text-body-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
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
