"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, FileText } from "lucide-react";
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
    <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
      <div className="bg-white/5 border-b border-white/5 px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-electric-blue/20 flex items-center justify-center text-electric-blue border border-electric-blue/30">
            <FileText className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Research Report
            </h3>
            <div className="flex gap-4 text-xs text-text-secondary mt-1">
              <span>{learningsCount} Key Findings</span>
              <span className="text-white/20">•</span>
              <span>{sourcesCount} Sources</span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="border-white/10 hover:bg-white/5"
        >
          {copied ? (
            <>
              <Check className="size-4 mr-2 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-4 mr-2" />
              <span>Copy Report</span>
            </>
          )}
        </Button>
      </div>

      <div className="p-8 md:p-12">
        <div
          className="prose prose-invert max-w-none 
            prose-headings:text-white prose-headings:font-medium prose-headings:tracking-tight 
            prose-p:text-text-secondary prose-p:leading-relaxed 
            prose-a:text-electric-blue prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white prose-strong:font-semibold
            prose-ul:text-text-secondary prose-li:marker:text-electric-blue/50
            prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-white prose-code:font-mono prose-code:text-sm
            prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl"
        >
          <ReactMarkdown
            components={{
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-electric-blue hover:text-electric-blue/80 transition-colors"
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
    </div>
  );
}
