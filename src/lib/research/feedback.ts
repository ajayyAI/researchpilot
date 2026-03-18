import { generateText, Output } from "ai";
import { getFeedbackPrompt, getSystemPrompt } from "./prompts";
import { getModel } from "./providers";
import { FeedbackSchema } from "./types";

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
