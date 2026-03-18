"use client";

import { CheckCircle2, MapIcon, Search } from "lucide-react";
import type { ResearchPlan as ResearchPlanType } from "@/lib/research";

interface ResearchPlanProps {
  plan: ResearchPlanType;
  isActive?: boolean;
}

const priorityColors: Record<string, string> = {
  high: "bg-success",
  medium: "bg-amber-500",
  low: "bg-text-muted",
};

export function ResearchPlan({ plan, isActive = false }: ResearchPlanProps) {
  return (
    <section
      className="surface rounded-xl overflow-hidden"
      aria-label="Research plan"
    >
      <div className="bg-bg-elevated/50 border-b border-border px-5 py-3 flex items-center gap-2.5">
        {isActive ? (
          <MapIcon className="size-4 text-accent" />
        ) : (
          <CheckCircle2 className="size-4 text-success" />
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-text-primary">
            Research Plan
          </h3>
          <p className="text-xs text-text-muted mt-0.5 max-w-lg truncate">
            {plan.scope}
          </p>
        </div>
      </div>

      <ul className="px-5 py-3 space-y-1.5" aria-label="Research aspects">
        {plan.aspects.map((aspect) => (
          <li
            key={aspect.id}
            className="flex items-center gap-3 rounded-lg px-3 py-2 bg-bg-primary/50"
          >
            <span
              className={`size-2 rounded-full shrink-0 ${priorityColors[aspect.priority] ?? "bg-text-muted"}`}
              aria-hidden="true"
            />
            <span className="text-sm text-text-primary truncate flex-1">
              {aspect.topic}
            </span>
            <span className="text-xs text-text-muted shrink-0">
              {aspect.subQuestions.length} questions
            </span>
          </li>
        ))}
      </ul>

      <div className="px-5 pb-3 flex items-center gap-1.5 text-xs text-text-muted">
        <Search className="size-3" aria-hidden="true" />
        <span>{plan.estimatedSearches} searches queued</span>
      </div>
    </section>
  );
}
