"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, Check, Copy, ExternalLink } from "lucide-react";
import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";

interface ResearchReportProps {
  report: string;
  learningsCount: number;
  sourcesCount: number;
}

export function ResearchReport({
  report,
  learningsCount,
  sourcesCount,
}: ResearchReportProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [report]);

  return (
    <div className="card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-bg-primary">
            <BookOpen className="size-5 text-text-muted" />
          </div>
          <h3 className="text-h5 font-semibold text-text-primary">
            Research Report
          </h3>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="flex gap-4 text-body-sm">
            <span className="text-text-muted">
              <span className="font-semibold text-text-primary">
                {learningsCount}
              </span>{" "}
              learnings
            </span>
            <span className="text-text-muted">
              <span className="font-semibold text-text-primary">
                {sourcesCount}
              </span>{" "}
              sources
            </span>
          </div>

          {/* Copy Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={copyToClipboard}
            className="text-text-muted hover:text-text-primary"
          >
            {copied ? (
              <Check className="size-4 text-heavy-metal" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border-default" />

      {/* Markdown Content */}
      <div className="prose prose-neutral max-w-none prose-headings:text-text-primary prose-headings:font-semibold prose-h1:text-h3 prose-h2:text-h4 prose-h3:text-h5 prose-p:text-text-secondary prose-p:leading-relaxed prose-strong:text-text-primary prose-a:text-text-primary prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-text-muted prose-code:bg-bg-primary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-body-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-bg-primary prose-pre:border prose-pre:border-border-default prose-pre:rounded-xl prose-ul:text-text-secondary prose-ol:text-text-secondary prose-li:marker:text-text-muted">
        <ReactMarkdown
          components={{
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
              >
                {children}
                <ExternalLink className="size-3" />
              </a>
            ),
          }}
        >
          {report}
        </ReactMarkdown>
      </div>
    </div>
  );
}
