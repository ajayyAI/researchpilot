import { generateFeedback } from "@/lib/research";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, numQuestions = 3 } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return Response.json(
        { error: "Query is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    const safeNumQuestions = Math.min(
      Math.max(Number(numQuestions) || 3, 1),
      5,
    );
    const questions = await generateFeedback(query, safeNumQuestions);

    return Response.json({ success: true, questions });
  } catch (error) {
    console.error("Feedback generation error:", error);
    return Response.json(
      { error: "Failed to generate feedback" },
      { status: 500 },
    );
  }
}
