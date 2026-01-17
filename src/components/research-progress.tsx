"use client";

import { Progress } from "@/components/ui/progress";
import type { ResearchProgress as ResearchProgressType } from "@/lib/research";
import { Layers, Search, Zap } from "lucide-react";

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

  const currentLevel = progress.totalDepth - progress.currentDepth + 1;

  return (
    <div className="card space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-h5 font-semibold text-text-primary">
          {isGeneratingReport ? "Generating Report" : "Research Progress"}
        </h3>
        <span className="text-body-sm font-semibold text-text-primary tabular-nums">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <Progress value={progressPercent} className="h-2" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-primary">
          <div className="p-2 rounded-lg bg-bg-secondary">
            <Layers className="size-4 text-text-muted" />
          </div>
          <div>
            <p className="text-caption text-text-muted">Depth Level</p>
            <p className="text-body-sm font-semibold text-text-primary">
              {currentLevel} of {progress.totalDepth}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-primary">
          <div className="p-2 rounded-lg bg-bg-secondary">
            <Zap className="size-4 text-text-muted" />
          </div>
          <div>
            <p className="text-caption text-text-muted">Queries</p>
            <p className="text-body-sm font-semibold text-text-primary">
              {progress.completedQueries} of {progress.totalQueries}
            </p>
          </div>
        </div>
      </div>

      {/* Current Query */}
      {progress.currentQuery && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-caption text-text-muted">
            <Search className="size-3.5" />
            <span>Current Query</span>
          </div>
          <p className="text-body-sm text-text-secondary line-clamp-2">
            {progress.currentQuery}
          </p>
        </div>
      )}

      {/* Status */}
      {progress.status && (
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-heavy-metal opacity-40" />
            <span className="relative inline-flex rounded-full size-2 bg-heavy-metal" />
          </span>
          <span className="text-body-sm text-text-muted">
            {progress.status}
          </span>
        </div>
      )}
    </div>
  );
}
