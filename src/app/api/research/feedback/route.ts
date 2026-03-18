import { z } from "zod";
import { generateFeedback } from "@/lib/research";

const FeedbackRequestSchema = z.object({
  query: z.string().trim().min(1),
  numQuestions: z.coerce.number().int().min(1).max(5).default(3),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsedBody = FeedbackRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return Response.json(
        { error: "Invalid request. Provide a non-empty query." },
        { status: 400 },
      );
    }

    const { query, numQuestions } = parsedBody.data;
    const questions = await generateFeedback(query, numQuestions);

    return Response.json({ success: true, questions });
  } catch (error) {
    console.error("Feedback generation error:", error);

    const message =
      error instanceof Error &&
      /(_API_KEY|AI_PROVIDER|AI_MODEL|FIRECRAWL)/.test(error.message)
        ? "Feedback generation is not configured correctly. Check the required API keys and provider settings."
        : "Failed to generate feedback";

    return Response.json({ error: message }, { status: 500 });
  }
}
