"use client";

import { Check, Copy, Download, ExternalLink, FileText } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

interface ResearchReportProps {
  report: string;
  findingsCount: number;
  sourcesCount: number;
  query: string;
}

export function ResearchReport({
  report,
  findingsCount,
  sourcesCount,
  query,
}: ResearchReportProps) {
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  }, [report]);

  const downloadMarkdown = useCallback(() => {
    const slug = query
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
    const filename = `research-${slug || "report"}.md`;
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [report, query]);

  return (
    <article
      className="surface rounded-xl overflow-hidden"
      aria-label="Research report"
    >
      <div className="bg-bg-elevated/50 border-b border-border px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <FileText className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-primary">
              Research Report
            </h3>
            <div className="flex gap-2 text-xs text-text-muted mt-0.5">
              <span>{findingsCount} findings</span>
              <span aria-hidden="true">|</span>
              <span>{sourcesCount} sources</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadMarkdown}
            className="text-text-muted"
            aria-label="Download as markdown"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">.md</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            aria-label={
              copied ? "Copied to clipboard" : "Copy report to clipboard"
            }
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-success" />
                <span className="text-success">Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-5 md:p-8">
        <div
          className="prose prose-sm max-w-none dark:prose-invert
            prose-headings:text-text-primary prose-headings:font-semibold prose-headings:tracking-tight
            prose-p:text-text-secondary prose-p:leading-relaxed
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-strong:text-text-primary prose-strong:font-semibold
            prose-ul:text-text-secondary prose-li:marker:text-accent/40
            prose-code:bg-bg-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-text-primary prose-code:font-mono prose-code:text-xs
            prose-pre:bg-bg-primary prose-pre:border prose-pre:border-border prose-pre:rounded-lg"
        >
          <ReactMarkdown
            components={{
              a: ({ href, children }) => {
                const isSafe =
                  href?.startsWith("http://") || href?.startsWith("https://");
                if (!isSafe) return <span>{children}</span>;
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:text-accent/80 transition-colors"
                  >
                    {children}
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                );
              },
            }}
          >
            {report}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
