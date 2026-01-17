import { generateFeedback } from "@/lib/research";

/**
 * POST /api/research/feedback
 * 
 * Generate follow-up questions to clarify research direction.
 * Called before starting the main research to refine the query.
 */
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { query, numQuestions = 3 } = body;

		if (!query || typeof query !== "string") {
			return Response.json(
				{ error: "Query is required and must be a string" },
				{ status: 400 }
			);
		}

		const questions = await generateFeedback(
			query,
			Math.min(Math.max(numQuestions, 1), 5)
		);

		return Response.json({
			success: true,
			questions,
		});
	} catch (error) {
		console.error("Feedback generation error:", error);
		return Response.json(
			{ error: error instanceof Error ? error.message : "Failed to generate feedback" },
			{ status: 500 }
		);
	}
}
