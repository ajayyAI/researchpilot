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
