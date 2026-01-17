import { generateText, Output } from "ai";

import { getModel } from "./providers";
import { getFeedbackPrompt, getSystemPrompt } from "./prompts";
import { FeedbackSchema } from "./types";

/**
 * Generate clarifying follow-up questions before starting research.
 * Helps refine the research direction based on user input.
 *
 * @param query - The user's initial research query
 * @param numQuestions - Maximum number of questions to generate (default: 3)
 * @returns Array of follow-up questions
 */
export async function generateFeedback(
  query: string,
  numQuestions = 3,
): Promise<string[]> {
  const { output } = await generateText({
    model: getModel(),
    system: getSystemPrompt(),
    prompt: getFeedbackPrompt(query, numQuestions),
    output: Output.object({
      schema: FeedbackSchema,
    }),
  });

  if (!output) {
    return [];
  }

  return output.questions.slice(0, numQuestions);
}
