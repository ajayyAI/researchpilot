"use client";

import {
  ArrowRight,
  BookOpen,
  Loader2,
  Microscope,
  Search,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EffortLevel } from "@/lib/research";

interface ResearchFormProps {
  query: string;
  onQueryChange: (query: string) => void;
  effort: EffortLevel;
  onEffortChange: (effort: EffortLevel) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const EFFORT_OPTIONS: Array<{
  value: EffortLevel;
  label: string;
  description: string;
  icon: typeof Zap;
}> = [
  {
    value: "quick",
    label: "Quick",
    description: "Fast scan, key facts",
    icon: Zap,
  },
  {
    value: "thorough",
    label: "Thorough",
    description: "Multi-source analysis",
    icon: BookOpen,
  },
  {
    value: "deep",
    label: "Deep",
    description: "Exhaustive research",
    icon: Microscope,
  },
];

export function ResearchForm({
  query,
  onQueryChange,
  effort,
  onEffortChange,
  onSubmit,
  isLoading,
}: ResearchFormProps) {
  return (
    <div className="space-y-5">
      <div className="surface rounded-xl overflow-hidden transition-all focus-within:border-accent/30 focus-within:ring-1 focus-within:ring-accent/20">
        <label htmlFor="research-query" className="sr-only">
          Research topic
        </label>
        <textarea
          id="research-query"
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
          <fieldset
            className="flex items-center gap-1.5"
            aria-label="Research depth"
          >
            {EFFORT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const selected = effort === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onEffortChange(opt.value)}
                  disabled={isLoading}
                  aria-pressed={selected}
                  title={opt.description}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    selected
                      ? "bg-accent/15 text-accent border border-accent/30"
                      : "text-text-muted hover:text-text-secondary hover:bg-bg-elevated border border-transparent"
                  } disabled:opacity-50 disabled:pointer-events-none`}
                >
                  <Icon className="size-3.5" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </fieldset>

          <Button
            onClick={onSubmit}
            disabled={!query.trim() || isLoading}
            size="sm"
            className="rounded-lg px-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Researching...</span>
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
        Press Enter to start. The AI builds a research plan and decides how deep
        to go based on your query.
      </p>
    </div>
  );
}
