"use client";

import { ArrowRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

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
    <div className="space-y-5">
      <div className="surface rounded-xl overflow-hidden transition-all focus-within:border-accent/30 focus-within:ring-1 focus-within:ring-accent/20">
        <textarea
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              query.trim() &&
              !isLoading
            ) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Describe your research topic in detail..."
          disabled={isLoading}
          rows={3}
          className="w-full bg-transparent text-text-primary text-base leading-relaxed placeholder:text-text-muted px-5 pt-4 pb-2 resize-none focus:outline-none disabled:opacity-50"
        />

        <div className="flex items-center justify-between px-5 pb-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <label
                htmlFor="breadth"
                className="text-xs font-medium text-text-muted"
              >
                Breadth
              </label>
              <Slider
                id="breadth"
                min={1}
                max={10}
                step={1}
                value={[breadth]}
                onValueChange={(v) => onBreadthChange(v[0])}
                disabled={isLoading}
                className="w-20"
              />
              <span className="text-xs font-mono text-text-secondary w-3 text-right">
                {breadth}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <label
                htmlFor="depth"
                className="text-xs font-medium text-text-muted"
              >
                Depth
              </label>
              <Slider
                id="depth"
                min={1}
                max={5}
                step={1}
                value={[depth]}
                onValueChange={(v) => onDepthChange(v[0])}
                disabled={isLoading}
                className="w-20"
              />
              <span className="text-xs font-mono text-text-secondary w-3 text-right">
                {depth}
              </span>
            </div>
          </div>

          <Button
            onClick={onSubmit}
            disabled={!query.trim() || isLoading}
            size="sm"
            className="rounded-lg px-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>{loadingText}</span>
              </>
            ) : (
              <>
                <Search className="size-3.5" />
                <span>Research</span>
                <ArrowRight className="size-3" />
              </>
            )}
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-text-muted">
        Press Enter to start. Breadth = parallel queries per step. Depth =
        recursive follow-up levels.
      </p>
    </div>
  );
}
