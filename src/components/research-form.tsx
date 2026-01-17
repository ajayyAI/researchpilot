"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, Loader2 } from "lucide-react";

interface ResearchFormProps {
  query: string;
  onQueryChange: (query: string) => void;
  breadth: number;
  onBreadthChange: (breadth: number) => void;
  depth: number;
  onDepthChange: (depth: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
  loadingText?: string;
}

export function ResearchForm({
  query,
  onQueryChange,
  breadth,
  onBreadthChange,
  depth,
  onDepthChange,
  onSubmit,
  isLoading,
  loadingText = "Researching...",
}: ResearchFormProps) {
  return (
    <div className="card space-y-8">
      <div className="space-y-3">
        <label
          htmlFor="query"
          className="text-body-sm font-medium text-text-primary"
        >
          Research Topic
        </label>
        <textarea
          id="query"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="What would you like to research? Be specific for better results..."
          className="w-full min-h-[120px] px-5 py-4 bg-bg-primary border border-border-default rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors resize-none text-body leading-relaxed"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label
              htmlFor="breadth"
              className="text-body-sm font-medium text-text-primary"
            >
              Breadth
            </label>
            <span className="text-body-sm font-semibold text-text-primary tabular-nums">
              {breadth}
            </span>
          </div>
          <Slider
            id="breadth"
            min={1}
            max={10}
            step={1}
            value={[breadth]}
            onValueChange={(value) => onBreadthChange(value[0])}
            disabled={isLoading}
          />
          <p className="text-caption text-text-muted">
            Number of parallel queries per level
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label
              htmlFor="depth"
              className="text-body-sm font-medium text-text-primary"
            >
              Depth
            </label>
            <span className="text-body-sm font-semibold text-text-primary tabular-nums">
              {depth}
            </span>
          </div>
          <Slider
            id="depth"
            min={1}
            max={5}
            step={1}
            value={[depth]}
            onValueChange={(value) => onDepthChange(value[0])}
            disabled={isLoading}
          />
          <p className="text-caption text-text-muted">
            Levels of recursive research
          </p>
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={!query.trim() || isLoading}
        variant="dark"
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            <span>Start Research</span>
            <ArrowRight className="size-5" />
          </>
        )}
      </Button>
    </div>
  );
}
