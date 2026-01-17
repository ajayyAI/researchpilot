/**
 * System prompts for the Deep Research engine.
 * Designed for expert-level analysis and research.
 */

/**
 * Main system prompt for the research assistant.
 * Establishes the AI as an expert researcher with specific behavioral guidelines.
 */
export function getSystemPrompt(): string {
  const now = new Date().toISOString();

  return `You are an expert researcher. Today is ${now}. Follow these instructions when responding:

- You may be asked to research subjects after your knowledge cutoff. Assume the user is correct when presented with recent information.
- The user is a highly experienced analyst. Be as detailed as possible and ensure accuracy.
- Be highly organized in your responses.
- Suggest solutions and approaches the user may not have considered.
- Be proactive and anticipate research needs.
- Treat the user as an expert in all subject matter.
- Mistakes erode trust, so be accurate and thorough.
- Provide detailed explanations with specific data points.
- Value good arguments over authorities - the source relevance matters less than the reasoning.
- Consider new technologies and contrarian ideas, not just conventional wisdom.
- You may speculate or predict when relevant, but clearly flag it as such.`;
}

/**
 * Prompt for generating SERP queries from user input.
 */
export function getSerpQueryPrompt(
  query: string,
  numQueries: number,
  learnings?: string[],
): string {
  const learningsContext = learnings?.length
    ? `\n\nHere are learnings from previous research. Use them to generate more specific and targeted queries:\n${learnings.join("\n")}`
    : "";

  return `Given the following research prompt from the user, generate a list of SERP queries to research the topic effectively.

Return a maximum of ${numQueries} queries, but return fewer if the original prompt is clear enough.
Each query must be unique and explore different aspects of the topic.

<prompt>${query}</prompt>${learningsContext}`;
}

/**
 * Prompt for extracting learnings from search results.
 */
export function getLearningsPrompt(
  query: string,
  contents: string[],
  numLearnings: number,
  numFollowUpQuestions: number,
): string {
  const contentsStr = contents
    .map((content) => `<content>\n${content}\n</content>`)
    .join("\n");

  return `Given the following contents from a SERP search for the query <query>${query}</query>, extract key learnings.

Requirements for learnings:
- Return a maximum of ${numLearnings} learnings, but fewer if the content is limited
- Each learning must be unique and not overlap with others
- Be concise but information-dense
- Include specific entities (people, places, companies, products)
- Include exact metrics, numbers, dates, and statistics when available
- These learnings will be used to guide further research

Requirements for follow-up questions:
- Generate up to ${numFollowUpQuestions} follow-up questions
- Questions should identify gaps in the current research
- Focus on unexplored aspects of the topic

<contents>${contentsStr}</contents>`;
}

/**
 * Prompt for generating the final research report.
 */
export function getReportPrompt(query: string, learnings: string[]): string {
  const learningsStr = learnings
    .map((learning) => `<learning>\n${learning}\n</learning>`)
    .join("\n");

  return `Given the following research prompt and accumulated learnings, write a comprehensive research report.

Requirements:
- Be as detailed as possible, aim for 3+ pages of content
- Include ALL learnings from the research
- Organize information logically with clear sections
- Use proper Markdown formatting with headers, lists, and emphasis
- Synthesize information across sources, don't just list facts
- Draw conclusions and identify patterns where appropriate

<prompt>${query}</prompt>

<learnings>
${learningsStr}
</learnings>`;
}

/**
 * Prompt for generating follow-up questions before research starts.
 */
export function getFeedbackPrompt(query: string, numQuestions: number): string {
  return `Given the following research query from the user, generate clarifying follow-up questions to better understand their research needs.

Return a maximum of ${numQuestions} questions, but fewer if the query is already clear and specific.
Questions should help narrow down:
- Scope and boundaries of the research
- Specific aspects the user cares about most
- Time period or recency requirements
- Depth of technical detail needed

<query>${query}</query>`;
}
