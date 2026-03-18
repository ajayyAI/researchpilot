"use client";

import { Loader2, Search, Terminal } from "lucide-react";
import { useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import type { ResearchProgress as ResearchProgressType } from "@/lib/research";

interface ResearchProgressProps {
  progress: ResearchProgressType | null;
  progressLog: string[];
  isGeneratingReport?: boolean;
  query: string;
}

export function ResearchProgress({
  progress,
  progressLog,
  isGeneratingReport = false,
  query,
}: ResearchProgressProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const logLength = progressLog.length;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new log entries
  useEffect(() => {
    const container = logContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [logLength]);

  const progressPercent = progress
    ? progress.totalQueries > 0
      ? Math.round((progress.completedQueries / progress.totalQueries) * 100)
      : 5
    : 0;

  const depthLevel = progress
    ? progress.totalDepth - progress.currentDepth + 1
    : 1;

  return (
    <div className="surface rounded-xl overflow-hidden">
      <div className="bg-bg-elevated/50 border-b border-border px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Terminal className="size-4 text-accent" />
          <div>
            <h3 className="text-sm font-medium text-text-primary">
              {isGeneratingReport ? "Generating Report" : "Researching"}
            </h3>
            <p className="text-xs text-text-muted truncate max-w-md mt-0.5">
              {query}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          {progress && (
            <>
              <span className="font-mono">
                Depth {depthLevel}/{progress.totalDepth}
              </span>
              <span className="text-border">|</span>
              <span className="font-mono">
                {progress.completedQueries}/{progress.totalQueries} queries
              </span>
            </>
          )}
          <span className="font-mono text-accent font-semibold">
            {isGeneratingReport ? "Final" : `${progressPercent}%`}
          </span>
        </div>
      </div>

      <div className="px-5 pt-3">
        <Progress value={isGeneratingReport ? 95 : progressPercent} />
      </div>

      <div className="p-5">
        <div
          ref={logContainerRef}
          className="bg-bg-primary rounded-lg border border-border font-mono text-xs h-48 overflow-y-auto"
        >
          <div className="p-3 space-y-1.5">
            {progressLog.map((entry, idx) => (
              <div
                key={`log-${idx}-${entry.slice(0, 20)}`}
                className="flex items-start gap-2 text-text-secondary animate-[fade-in_0.3s_ease-out]"
              >
                {entry.startsWith("Searching:") ? (
                  <Search className="size-3 text-accent shrink-0 mt-0.5" />
                ) : (
                  <span className="text-accent shrink-0">{">"}</span>
                )}
                <span>{entry}</span>
              </div>
            ))}

            {isGeneratingReport && (
              <div className="flex items-center gap-2 text-accent">
                <Loader2 className="size-3 animate-spin" />
                <span>Synthesizing final report...</span>
              </div>
            )}

            {progressLog.length === 0 && !isGeneratingReport && (
              <div className="flex items-center gap-2 text-text-muted">
                <Loader2 className="size-3 animate-spin" />
                <span>Initializing research agent...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-3 flex items-center gap-1.5 text-xs text-text-muted">
        <div className="size-1.5 rounded-full bg-success animate-pulse" />
        <span>Active</span>
      </div>
    </div>
  );
}
