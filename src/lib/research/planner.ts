import { generateText, Output } from "ai";
import { getSystemPrompt } from "./prompts";
import { getModel } from "./providers";
import { type ResearchPlan, ResearchPlanSchema } from "./types";

export async function generateResearchPlan(
  query: string,
  feedbackAnswers?: Array<{ question: string; answer: string }>,
): Promise<ResearchPlan> {
  const prompt = getPlanningPrompt(query, feedbackAnswers);

  const { output } = await generateText({
    model: getModel("strategic"),
    system: getSystemPrompt(),
    prompt,
    output: Output.object({
      schema: ResearchPlanSchema,
    }),
    abortSignal: AbortSignal.timeout(60_000),
  });

  if (!output) {
    return createFallbackPlan(query);
  }

  return output;
}

export function createFallbackPlan(query: string): ResearchPlan {
  return {
    aspects: [
      {
        id: "main",
        topic: "General Research",
        description: query,
        subQuestions: [query],
        priority: "high",
      },
    ],
    estimatedSearches: 4,
    successCriteria: ["Found relevant information addressing the query"],
    scope: query,
  };
}

function getPlanningPrompt(
  query: string,
  feedbackAnswers?: Array<{ question: string; answer: string }>,
): string {
  const feedbackContext = feedbackAnswers?.length
    ? `\n\nThe user provided these clarifications:\n${feedbackAnswers.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}`
    : "";

  return `Create a structured research plan for the following query. Your plan will guide an automated research system that executes web searches and synthesizes findings.

## Requirements

1. **Decompose** the query into 2-5 distinct research aspects. Each aspect should cover a different angle or dimension of the topic.
2. **For each aspect**, provide:
   - A unique ID (short, lowercase, hyphenated — e.g., "market-size", "key-players", "tech-stack")
   - A short topic label
   - A description of what needs to be investigated
   - 2-4 specific sub-questions that searches should answer
   - Priority level: "high" (essential to answer the query), "medium" (valuable context), "low" (nice-to-have depth)
   - Optional: expected source types (e.g., "academic papers", "industry reports", "official documentation")
3. **Estimate** the total number of search queries needed across all aspects.
4. **Define success criteria** — what constitutes a complete answer? List 2-4 specific criteria.
5. **Define scope** — what are the explicit boundaries? What is included and excluded?

## Guidelines
- High-priority aspects should cover the core of what the user is asking
- Medium-priority aspects provide important context or comparison
- Low-priority aspects add depth for a more comprehensive report
- Ensure aspects don't overlap significantly — each should target distinct information
- Sub-questions should be specific enough to generate effective search queries
- Consider multiple perspectives: technical, business, regulatory, user/consumer where relevant

<query>${query}</query>${feedbackContext}`;
}
