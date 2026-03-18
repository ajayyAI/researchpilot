export function getSystemPrompt(): string {
  const now = new Date().toISOString();

  return `You are an expert research analyst. Today is ${now}.

## Core Principles
- Accuracy above all. Every claim must be grounded in the source material provided. Clearly distinguish verified facts from inference or speculation.
- Be information-dense. Prefer specific data points, metrics, dates, and named entities over vague summaries.
- Evaluate sources critically. Academic papers and primary sources carry more weight than blog posts or marketing content. Note when a finding comes from a single source vs. multiple corroborating sources.
- The user is an experienced analyst. Write for an expert audience — no hand-holding, no filler.
- Consider contrarian and emerging perspectives, not just conventional wisdom.
- When speculating or inferring beyond the source material, explicitly flag it as such.`;
}

export function getSerpQueryPrompt(
  query: string,
  numQueries: number,
  learnings?: string[],
): string {
  const learningsContext = learnings?.length
    ? `\n\nPrevious research findings (use these to generate more targeted, non-redundant queries):\n${learnings.map((l) => `- ${l}`).join("\n")}`
    : "";

  return `Generate up to ${numQueries} search queries to research the following topic. Each query should explore a distinct angle — avoid overlap.

For each query, include a researchGoal explaining what specific information this query aims to uncover and how it advances the overall research.

<topic>${query}</topic>${learningsContext}`;
}

export function getLearningsPrompt(
  query: string,
  contents: string[],
  numLearnings: number,
  numFollowUpQuestions: number,
): string {
  const contentsStr = contents
    .map((content) => `<content>\n${content}\n</content>`)
    .join("\n");

  return `Analyze the following search results for the query "${query}" and extract key findings.

## Requirements for learnings
- Extract up to ${numLearnings} learnings. Fewer is fine if the content is thin.
- Each learning must be a unique, non-overlapping insight.
- Be specific: include exact names, numbers, dates, percentages, and metrics when available.
- Assess source quality: note if a finding is from a primary source, peer-reviewed research, industry report, or opinion piece.
- If multiple sources corroborate a finding, note that — it increases confidence.

## Requirements for follow-up questions
- Generate up to ${numFollowUpQuestions} follow-up questions that would fill gaps in the current research.
- Focus on areas where the current results are thin, contradictory, or raise new questions.

<contents>${contentsStr}</contents>`;
}

export function getReportPrompt(query: string, learnings: string[]): string {
  const learningsStr = learnings
    .map((learning) => `<learning>\n${learning}\n</learning>`)
    .join("\n");

  return `Write a comprehensive research report based on the following topic and accumulated findings.

## Report Requirements
- Synthesize all findings into a coherent narrative — don't just list facts.
- Use clear Markdown structure: title, sections with headers, bullet points for key data.
- Where multiple sources agree on a point, state the consensus. Where sources conflict, note the disagreement.
- Draw conclusions and identify patterns across the findings.
- Include a "Key Takeaways" section at the end with the most important 3-5 insights.
- Cite source URLs inline where relevant using markdown links.

<topic>${query}</topic>

<findings>
${learningsStr}
</findings>`;
}

export function getFeedbackPrompt(query: string, numQuestions: number): string {
  return `Given the following research query, generate up to ${numQuestions} clarifying questions that would help narrow the scope and improve research quality.

Focus on:
- Scope and boundaries (time period, geography, industry)
- Specific aspects the user likely cares about most
- Level of technical depth needed
- Any ambiguity in the query that could lead to unfocused research

Return fewer questions if the query is already clear and specific.

<query>${query}</query>`;
}
