"use client";

import { useState, useCallback } from "react";
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

export default function Home() {
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Deep Research
          </h1>
          <p className="text-zinc-400 text-lg">
            AI-powered recursive research on any topic
          </p>
        </header>

        {/* Research Form */}
        <div className="bg-zinc-900 rounded-xl p-6 mb-8 border border-zinc-800">
          <div className="mb-6">
            <label htmlFor="query" className="block text-sm font-medium mb-2">
              Research Topic
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What would you like to research? E.g., Latest developments in AI agents..."
              className="w-full h-24 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={
                state === "researching" || state === "generating-report"
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="breadth"
                className="block text-sm font-medium mb-2"
              >
                Breadth: {breadth}
              </label>
              <input
                id="breadth"
                type="range"
                min="1"
                max="10"
                value={breadth}
                onChange={(e) => setBreadth(Number(e.target.value))}
                className="w-full accent-blue-500"
                disabled={
                  state === "researching" || state === "generating-report"
                }
              />
              <p className="text-xs text-zinc-500 mt-1">
                Parallel queries per level
              </p>
            </div>
            <div>
              <label htmlFor="depth" className="block text-sm font-medium mb-2">
                Depth: {depth}
              </label>
              <input
                id="depth"
                type="range"
                min="1"
                max="5"
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="w-full accent-blue-500"
                disabled={
                  state === "researching" || state === "generating-report"
                }
              />
              <p className="text-xs text-zinc-500 mt-1">
                Recursive research levels
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={startResearch}
            disabled={
              !query.trim() ||
              state === "researching" ||
              state === "generating-report"
            }
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {state === "researching"
              ? "Researching..."
              : state === "generating-report"
                ? "Generating Report..."
                : "Start Research"}
          </button>
        </div>

        {/* Progress display */}
        {progress &&
          (state === "researching" || state === "generating-report") && (
            <div className="bg-zinc-900 rounded-xl p-6 mb-8 border border-zinc-800">
              <h2 className="text-lg font-semibold mb-4">Research Progress</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Depth</span>
                  <span>
                    {progress.totalDepth - progress.currentDepth + 1} /{" "}
                    {progress.totalDepth}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Queries Completed</span>
                  <span>
                    {progress.completedQueries} / {progress.totalQueries}
                  </span>
                </div>
                {progress.currentQuery && (
                  <div className="mt-4">
                    <p className="text-xs text-zinc-500 mb-1">Current Query</p>
                    <p className="text-sm text-zinc-300 truncate">
                      {progress.currentQuery}
                    </p>
                  </div>
                )}
                {progress.status && (
                  <div className="mt-2">
                    <p className="text-xs text-zinc-500 mb-1">Status</p>
                    <p className="text-sm text-blue-400">{progress.status}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Error display */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Error</h2>
            <p className="text-zinc-300">{error}</p>
          </div>
        )}

        {/* Results display */}
        {result && state === "complete" && (
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Research Report</h2>
              <div className="flex gap-4 text-sm text-zinc-400">
                <span>{result.summary.totalLearnings} learnings</span>
                <span>{result.summary.totalSources} sources</span>
              </div>
            </div>

            {/* Report content - rendered as markdown-like text */}
            <div className="prose prose-invert prose-zinc max-w-none">
              <div
                className="whitespace-pre-wrap text-zinc-300 leading-relaxed"
                style={{ fontFamily: "inherit" }}
              >
                {result.report}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
