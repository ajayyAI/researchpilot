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

const MAX_VISIBLE_LOG_ENTRIES = 200;

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

  const hasAspects =
    progress?.aspectsTotal != null && progress.aspectsTotal > 0;

  const progressPercent = progress
    ? hasAspects
      ? Math.round((progress.aspectsComplete / progress.aspectsTotal) * 100)
      : progress.totalQueries > 0
        ? Math.round((progress.completedQueries / progress.totalQueries) * 100)
        : 5
    : 0;

  const visibleLog = progressLog.slice(-MAX_VISIBLE_LOG_ENTRIES);

  return (
    <section
      className="surface rounded-xl overflow-hidden"
      aria-label="Research progress"
    >
      <div className="bg-bg-elevated/50 border-b border-border px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <Terminal className="size-4 text-accent shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-text-primary">
              {isGeneratingReport ? "Generating Report" : "Researching"}
            </h3>
            <p className="text-xs text-text-muted truncate max-w-md mt-0.5">
              {progress?.currentAspect ?? query}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-secondary shrink-0">
          {progress && (
            <>
              {hasAspects && (
                <>
                  <span className="font-mono">
                    {progress.aspectsComplete}/{progress.aspectsTotal} aspects
                  </span>
                  <span className="text-border">|</span>
                </>
              )}
              {progress.findingsCount != null && (
                <>
                  <span className="font-mono">
                    {progress.findingsCount} findings
                  </span>
                  <span className="text-border">|</span>
                </>
              )}
              {progress.sourcesAssessed != null && (
                <span className="font-mono">
                  {progress.sourcesAssessed} sources
                </span>
              )}
            </>
          )}
          <span className="font-mono text-accent font-semibold">
            {isGeneratingReport ? "Final" : `${progressPercent}%`}
          </span>
        </div>
      </div>

      <div className="px-5 pt-3">
        <Progress
          value={isGeneratingReport ? 95 : progressPercent}
          aria-label={`Research progress: ${isGeneratingReport ? "generating report" : `${progressPercent}%`}`}
        />
      </div>

      <div className="p-5">
        <div
          ref={logContainerRef}
          aria-live="polite"
          className="bg-bg-primary rounded-lg border border-border font-mono text-xs h-48 overflow-y-auto"
        >
          <div className="p-3 space-y-1.5">
            {visibleLog.map((entry) => (
              <div
                key={entry}
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
                <span>Writing report...</span>
              </div>
            )}

            {progressLog.length === 0 && !isGeneratingReport && (
              <div className="flex items-center gap-2 text-text-muted">
                <Loader2 className="size-3 animate-spin" />
                <span>Getting started...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-3 flex items-center gap-1.5 text-xs text-text-muted">
        <div
          className="size-1.5 rounded-full bg-success animate-pulse"
          aria-hidden="true"
        />
        <span>Active</span>
      </div>
    </section>
  );
}
