import { z } from "zod";
import {
  createFallbackPlan,
  EFFORT_DEFAULTS,
  generateReport,
  generateResearchPlan,
  orchestrate,
  type ResearchPlan,
  serializeState,
} from "@/lib/research";

const ResearchRequestSchema = z.object({
  query: z.string().trim().min(1).max(2000),
  effort: z.enum(["quick", "thorough", "deep"]).default("thorough"),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsedBody = ResearchRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return Response.json(
        {
          error:
            "Invalid request. Provide a non-empty query (max 2000 chars) and an optional effort level.",
        },
        { status: 400 },
      );
    }

    const { query, effort } = parsedBody.data;
    const { breadth, depth } = EFFORT_DEFAULTS[effort];

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let closed = false;

        const closeStream = () => {
          if (closed) return;
          closed = true;
          controller.close();
        };

        const sendEvent = (event: string, data: unknown) => {
          if (closed || request.signal.aborted) return;
          try {
            const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
          } catch {
            closeStream();
          }
        };

        try {
          sendEvent("status", {
            status: "planning",
            message: "Building research plan...",
          });

          let plan: ResearchPlan;
          try {
            plan = await generateResearchPlan(query);
          } catch {
            plan = createFallbackPlan(query);
          }

          sendEvent("plan", { plan });

          sendEvent("status", {
            status: "researching",
            message: `Researching ${plan.aspects.length} areas...`,
          });

          const state = await orchestrate({
            query,
            breadth,
            depth,
            plan,
            signal: request.signal,
            onProgress: (progress) => {
              sendEvent("progress", progress);
            },
            onFinding: (finding) => {
              sendEvent("finding", finding);
            },
            onSource: (source) => {
              sendEvent("source", source);
            },
            onAspectComplete: (aspectId, result) => {
              sendEvent("aspect-complete", {
                aspectId,
                findingsCount: result.findings.length,
                sourcesCount: result.sources.length,
              });
            },
          });

          const serialized = serializeState(state);

          const report = await generateReport(state, {
            signal: request.signal,
            onStatus: (status) =>
              sendEvent("status", {
                status: "generating-report",
                message: status,
              }),
            onOutline: (outline) => sendEvent("report-outline", outline),
            onSection: (sectionId, markdown) =>
              sendEvent("report-section", { sectionId, markdown }),
          });

          sendEvent("complete", {
            report,
            state: serialized,
            summary: {
              totalFindings: state.findings.length,
              totalSources: state.sources.size,
              coverageMap: Object.fromEntries(state.coverageMap),
            },
          });

          closeStream();
        } catch (error) {
          if (!request.signal.aborted) {
            console.error("Research error:", error);

            const message =
              error instanceof Error &&
              /(_API_KEY|AI_PROVIDER|AI_MODEL|FIRECRAWL)/.test(error.message)
                ? "Research is not configured correctly. Check the required API keys and provider settings."
                : "Research failed. Please try again.";

            sendEvent("error", { error: message });
          }

          closeStream();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
