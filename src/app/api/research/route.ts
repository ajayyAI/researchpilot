import { z } from "zod";
import { deepResearch, generateReport } from "@/lib/research";

const ResearchRequestSchema = z.object({
  query: z.string().trim().min(1).max(2000),
  breadth: z.coerce.number().int().min(1).max(10).default(4),
  depth: z.coerce.number().int().min(1).max(5).default(2),
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
            "Invalid request. Provide a non-empty query plus breadth and depth values within the supported ranges.",
        },
        { status: 400 },
      );
    }

    const { query, breadth, depth } = parsedBody.data;

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
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          sendEvent("status", {
            status: "starting",
            message: "Starting deep research...",
          });

          const result = await deepResearch({
            query,
            breadth,
            depth,
            onProgress: (progress) => {
              sendEvent("progress", progress);
            },
          });

          sendEvent("status", {
            status: "generating-report",
            message: `Generating report from ${result.learnings.length} learnings...`,
          });

          const report = await generateReport(
            query,
            result.learnings,
            result.visitedUrls,
          );

          sendEvent("complete", {
            report,
            learnings: result.learnings,
            visitedUrls: result.visitedUrls,
            summary: {
              totalLearnings: result.learnings.length,
              totalSources: result.visitedUrls.length,
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
