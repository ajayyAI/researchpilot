import { deepResearch, generateReport } from "@/lib/research";

/**
 * POST /api/research
 *
 * Main research endpoint that performs deep research on a topic.
 * Streams progress updates to the client.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, breadth = 4, depth = 2 } = body;

    if (!query || typeof query !== "string") {
      return Response.json(
        { error: "Query is required and must be a string" },
        { status: 400 },
      );
    }

    // Create a text encoder for streaming
    const encoder = new TextEncoder();

    // Create a readable stream for sending progress updates
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          // Send initial status
          sendEvent("status", {
            status: "starting",
            message: "Starting deep research...",
          });

          // Run the research with progress callbacks
          const result = await deepResearch({
            query,
            breadth: Math.min(Math.max(breadth, 1), 10),
            depth: Math.min(Math.max(depth, 1), 5),
            onProgress: (progress) => {
              sendEvent("progress", progress);
            },
          });

          // Send learnings count
          sendEvent("status", {
            status: "generating-report",
            message: `Generating report from ${result.learnings.length} learnings...`,
          });

          // Generate the final report
          const report = await generateReport(
            query,
            result.learnings,
            result.visitedUrls,
          );

          // Send the final result
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
          sendEvent("error", {
            error: error instanceof Error ? error.message : "Research failed",
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
