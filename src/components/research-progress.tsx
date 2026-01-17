"use client";

import { Progress } from "@/components/ui/progress";
import type { ResearchProgress as ResearchProgressType } from "@/lib/research";
import { Loader2, Terminal } from "lucide-react";

interface ResearchProgressProps {
  progress: ResearchProgressType;
  isGeneratingReport?: boolean;
}

export function ResearchProgress({
  progress,
  isGeneratingReport = false,
}: ResearchProgressProps) {
  const progressPercent =
    progress.totalQueries > 0
      ? Math.round((progress.completedQueries / progress.totalQueries) * 100)
      : 0;

  return (
    <div className="glass-card rounded-3xl border border-white/10 overflow-hidden">
      <div className="bg-white/5 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="size-5 text-electric-blue" />
          <h3 className="text-sm font-medium text-white">Research Agent</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-secondary font-mono">
            {progress.completedQueries} / {progress.totalQueries} Queries
          </span>
          <span className="text-sm font-mono text-electric-blue font-bold">
            {progressPercent}%
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Progress value={progressPercent} className="h-1 bg-white/10" />

        <div className="bg-black/40 rounded-xl p-4 font-mono text-sm border border-white/5 h-48 overflow-y-auto custom-scrollbar flex flex-col-reverse">
          <div className="space-y-3">
            {isGeneratingReport ? (
              <div className="flex items-center gap-3 text-neon-purple animate-pulse">
                <Loader2 className="size-4 animate-spin" />
                <span>Synthesizing final report...</span>
              </div>
            ) : progress.currentQuery ? (
              <div className="flex items-start gap-3 text-white">
                <span className="text-electric-blue shrink-0 mt-0.5">❯</span>
                <span>
                  Searching for:{" "}
                  <span className="text-text-secondary">
                    "{progress.currentQuery}"
                  </span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-text-muted">
                <span className="animate-pulse">_</span>
              </div>
            )}

            {/* We could show history here if we had it in the progress object, 
                    for now we just show the current state nicely */}
            {progress.completedQueries > 0 && (
              <div className="flex items-center gap-3 text-green-400/80">
                <span className="text-green-500">✓</span>
                <span>Completed {progress.completedQueries} search steps</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted px-2">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
            <span>Agent Active</span>
          </div>
          <div>
            Depth Level:{" "}
            <span className="text-white">
              {progress.totalDepth - progress.currentDepth + 1}
            </span>{" "}
            / {progress.totalDepth}
          </div>
        </div>
      </div>
    </div>
  );
}
