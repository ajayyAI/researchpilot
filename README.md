<div align="center">

# ResearchPilot

**AI deep research agent that plans, searches, verifies, and writes.**

One query in. Structured, source-backed report out.

[![License: MIT](https://img.shields.io/badge/License-MIT-d97706.svg)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000?logo=next.js)](https://nextjs.org)
[![Vercel AI SDK](https://img.shields.io/badge/AI_SDK-v6-000?logo=vercel)](https://sdk.vercel.ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)

[Demo](https://researchpilot.dev) &middot; [Getting Started](#getting-started) &middot; [Architecture](#architecture) &middot; [Configuration](#configuration) &middot; [Roadmap](#roadmap)

</div>

---

## What It Does

You type a question. ResearchPilot builds a research plan, executes dozens of targeted web searches in parallel, scores every source for credibility, decides when to go deeper and when to stop, detects contradictions across findings, and assembles a structured report with inline citations.

No manual knobs. The AI determines scope based on your query — you just pick Quick, Thorough, or Deep.

### How It Works

```
Query → Plan → Search → Extract → Assess → Repeat? → Report
```

1. **Plan** — A strategic LLM decomposes your query into 2-5 research aspects with sub-questions and priorities
2. **Search** — Parallel workers execute targeted queries across Firecrawl + Tavily
3. **Extract** — Findings are pulled from each source with claim, evidence, confidence, and source attribution
4. **Assess** — Every source gets a credibility score (domain heuristics + LLM assessment for unknowns)
5. **Adapt** — Information gain is measured after each round. Rich veins get explored deeper. Diminishing returns trigger early stopping
6. **Detect** — LLM-based contradiction detection flags conflicting claims across sources
7. **Gap-fill** — Coverage map identifies missing aspects, triggers up to 2 targeted follow-up rounds
8. **Report** — Outline → section-by-section generation → intro/conclusion → assembly with ranked sources

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Next.js App                           │
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌────────────────────────┐  │
│  │ Research  │──▶│ Planner  │──▶│  Research Orchestrator  │  │
│  │   Form    │   │(strategic│   │                        │  │
│  │           │   │   LLM)   │   │  ┌────────┐┌────────┐ │  │
│  │ Quick /   │   └──────────┘   │  │Worker 1││Worker 2│ │  │
│  │ Thorough /│                  │  │(aspect)││(aspect)│ │  │
│  │ Deep      │   SSE Stream     │  └───┬────┘└───┬────┘ │  │
│  └──────────┘   ◀──────────     │      └────┬────┘      │  │
│                                 │           ▼           │  │
│  ┌──────────────────────────┐   │  ┌─────────────────┐  │  │
│  │   Research Plan Card     │   │  │ Research State   │  │  │
│  │   Progress Tracker       │   │  │ (immutable)      │  │  │
│  │   Report Viewer          │   │  └────────┬────────┘  │  │
│  └──────────────────────────┘   │           ▼           │  │
│                                 │  ┌─────────────────┐  │  │
│                                 │  │ Report Pipeline  │  │  │
│                                 │  │ Outline→Sections │  │  │
│                                 │  │ →Intro→Assemble  │  │  │
│                                 │  └─────────────────┘  │  │
│                                 └────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Infrastructure                                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │    │
│  │  │ Search   │ │ Tiered   │ │Credibil- │ │ Info   │ │    │
│  │  │ Firecrawl│ │ Models   │ │ity       │ │ Gain   │ │    │
│  │  │ + Tavily │ │ fast /   │ │ Scoring  │ │ Stop   │ │    │
│  │  │ (+ Exa)  │ │ smart /  │ │ heuristic│ │        │ │    │
│  │  │          │ │ strategic│ │ + LLM    │ │        │ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Immutable state** — Research state is a pure data structure. Every mutation returns a new object. No side effects, easy to serialize, easy to debug.
- **Adaptive depth** — Information gain is measured after each search round. High novelty → keep going. Low novelty → stop. No wasted API calls.
- **Tiered models** — Fast/cheap models handle extraction (~70% of LLM calls). Smart models write the report. Strategic models plan. Cuts cost 40-60%.
- **Abort-aware pipeline** — Client disconnect kills all in-flight LLM calls and searches via `AbortSignal` propagation. No orphaned API spend.
- **Structured outputs** — Every LLM call uses Zod schemas via the Vercel AI SDK's `Output.object`. Type-safe from prompt to response.
- **Collect-then-merge** — Parallel workers return results independently. The orchestrator merges them sequentially after all settle — no race conditions.

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.2+
- A [Firecrawl](https://firecrawl.dev) API key (search + scraping)
- An AI provider key: [OpenRouter](https://openrouter.ai/keys), [OpenAI](https://platform.openai.com/api-keys), or [Groq](https://console.groq.com)

### Install

```bash
git clone https://github.com/ajayyAI/researchpilot.git
cd researchpilot
bun install
cp .env.example .env
```

### Configure

Edit `.env` with your API keys:

```bash
FIRECRAWL_API_KEY=fc-...        # required — web search + scraping
AI_PROVIDER=openrouter           # openai | openrouter | groq
OPENROUTER_API_KEY=sk-or-...    # key for your chosen provider
```

### Run

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000). Type a research topic. Pick an effort level. Go.

---

## Configuration

### Required

| Variable | Description |
|----------|-------------|
| `FIRECRAWL_API_KEY` | [Firecrawl](https://firecrawl.dev) API key for web search + scraping |
| `AI_PROVIDER` | `openai`, `openrouter`, or `groq` |
| Provider key | `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, or `GROQ_API_KEY` |

### Model Tiers (Optional)

Override the default model for each tier to optimize cost vs. quality:

| Variable | Tier | Used For | Example |
|----------|------|----------|---------|
| `AI_MODEL` | Default | Fallback for all tiers | `gpt-4.1` |
| `AI_MODEL_FAST` | Fast | Extraction, source scoring, gain assessment | `gpt-4.1-mini` |
| `AI_MODEL_STRATEGIC` | Strategic | Planning, query decomposition | `o4-mini` |

### Search Providers (Optional)

| Variable | Description |
|----------|-------------|
| `TAVILY_API_KEY` | Adds [Tavily](https://tavily.com) as a second search source |
| `TAVILY_SEARCH_DEPTH` | `basic` (default) or `advanced` |
| `FIRECRAWL_CONCURRENCY` | Parallel search limit (default: `2`, increase with paid plan) |

### Effort Levels

Users don't configure breadth or depth directly. They pick an effort level and the AI handles the rest:

| Level | What Happens | Typical Time | Best For |
|-------|-------------|-------------|----------|
| **Quick** | 2 parallel queries, 1 depth level | 30-60s | Fact-checks, simple lookups |
| **Thorough** | 4 parallel queries, 2 depth levels | 2-4 min | Standard research |
| **Deep** | 7 parallel queries, 3 depth levels | 5-10 min | Complex multi-faceted analysis |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) with Turbopack |
| Language | TypeScript 5 (strict) |
| AI | [Vercel AI SDK v6](https://sdk.vercel.ai) with Zod structured outputs |
| Search | [Firecrawl](https://firecrawl.dev) + [Tavily](https://tavily.com) (dual-source, deduped) |
| UI | React 19, [Tailwind CSS 4](https://tailwindcss.com), [Radix UI](https://radix-ui.com) |
| Streaming | Server-Sent Events with structured event types |
| Lint | [Biome](https://biomejs.dev) |
| Runtime | [Bun](https://bun.sh) |

---

## Project Structure

```
src/
├── app/
│   ├── api/research/
│   │   ├── route.ts              # SSE streaming endpoint
│   │   └── feedback/route.ts     # Clarification questions
│   └── page.tsx
├── components/
│   ├── home-page.tsx             # Main page — SSE client, state machine
│   ├── research-form.tsx         # Query input + effort selector
│   ├── research-plan.tsx         # Plan display card
│   ├── research-progress.tsx     # Live progress tracker + log
│   └── research-report.tsx       # Markdown report with copy/download
└── lib/research/
    ├── engine.ts                 # Orchestrator — parallel workers, gap analysis
    ├── workers.ts                # Aspect-level research with adaptive depth
    ├── planner.ts                # Research plan generation (strategic LLM)
    ├── report-pipeline.ts        # Outline → sections → assembly (smart LLM)
    ├── credibility.ts            # Source credibility scoring
    ├── gain.ts                   # Information gain assessment
    ├── search.ts                 # Multi-provider search with dedup + retry
    ├── state.ts                  # Immutable research state
    ├── providers.ts              # Tiered model selection
    ├── types.ts                  # Zod schemas + TypeScript types
    ├── prompts.ts                # System prompts
    └── text-utils.ts             # Token counting, text splitting
```

---

## How It Compares

| Feature | ResearchPilot | Deep-Research (Aomni) | GPT-Researcher | Perplexica |
|---------|:---:|:---:|:---:|:---:|
| Research planning | AI-generated | None | Multi-agent | None |
| Adaptive depth | Information-gain driven | Fixed halving | Fixed | Fixed |
| Source credibility | Heuristic + LLM | None | None | None |
| Contradiction detection | LLM-based | None | None | None |
| Report pipeline | Outline → sections | Single pass | Multi-agent review | Single pass |
| Tiered models | fast / smart / strategic | Single | Three-tier | Single |
| Multi-source search | Firecrawl + Tavily | Firecrawl | Tavily | SearXNG |
| Streaming | SSE with typed events | SSE | WebSocket | WebSocket |
| Self-hosted | Yes | Yes | Yes | Yes |

---

## Roadmap

- [ ] **Exa AI integration** — Neural/semantic search as third provider for highest-quality retrieval
- [ ] **Plan approval** — Review and edit the research plan before execution
- [ ] **Research replay** — Interactive trace of the full research tree
- [ ] **Citation verification** — Post-generation claim-to-source matching
- [ ] **Perspective-guided research** — Multi-perspective queries (STORM-inspired)
- [ ] **Interactive sessions** — Steer ongoing research in real time
- [ ] **Export formats** — PDF and DOCX alongside markdown
- [ ] **Research memory** — Vector store for cross-session knowledge
- [ ] **Local-first mode** — Ollama + SearXNG for fully offline research
- [ ] **MCP server** — Expose research capabilities as tools for any AI assistant

---

## Development

```bash
bun dev              # Dev server with Turbopack
bun run type-check   # TypeScript type checking
bun run ci           # Biome lint + format check
bun run check        # Auto-fix lint/format issues
bun run build        # Production build
bun run validate     # type-check + lint + build
```

---

## Contributing

Contributions welcome. Open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Run `bun run validate` before committing
4. Open a pull request

---

## License

MIT

---

<div align="center">

Built by [ajayyAI](https://github.com/ajayyAI)

</div>
