import { deepResearch, generateReport } from "@/lib/research";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, breadth = 4, depth = 2 } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return Response.json(
        { error: "Query is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    if (query.length > 2000) {
      return Response.json(
        { error: "Query must be under 2000 characters" },
        { status: 400 },
      );
    }

    const safeBreadth = Math.min(Math.max(Number(breadth) || 4, 1), 10);
    const safeDepth = Math.min(Math.max(Number(depth) || 2, 1), 5);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
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
            breadth: safeBreadth,
            depth: safeDepth,
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

          controller.close();
        } catch (error) {
          console.error("Research error:", error);
          sendEvent("error", { error: "Research failed. Please try again." });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
