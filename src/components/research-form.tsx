"use client";

import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="glass-card max-w-3xl mx-auto rounded-3xl p-8 md:p-10 border border-white/10">
      <div className="space-y-8">
        <div className="space-y-4">
          <label
            htmlFor="query"
            className="flex items-center gap-2 text-sm font-medium text-white ml-1"
          >
            <Sparkles className="size-4 text-electric-blue" />
            Research Topic
          </label>
          <Textarea
            id="query"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="What would you like to research? Be specific for better results..."
            disabled={isLoading}
            className="text-lg leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label
                htmlFor="breadth"
                className="text-sm font-medium text-text-secondary"
              >
                Breadth:{" "}
                <span className="text-white font-mono ml-2">{breadth}</span>
              </label>
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
            <p className="text-xs text-text-muted">
              Higher breadth means more parallel queries per step.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label
                htmlFor="depth"
                className="text-sm font-medium text-text-secondary"
              >
                Depth:{" "}
                <span className="text-white font-mono ml-2">{depth}</span>
              </label>
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
            <p className="text-xs text-text-muted">
              Higher depth means more recursive follow-up steps.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={onSubmit}
            disabled={!query.trim() || isLoading}
            variant="default"
            size="lg"
            className="w-full h-14 text-base rounded-2xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin mr-2" />
                <span>{loadingText}</span>
              </>
            ) : (
              <>
                <span>Start Deep Research</span>
                <ArrowRight className="size-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
