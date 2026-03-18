# ResearchPilot

AI-powered deep research assistant that recursively searches the web, extracts insights, and synthesizes comprehensive reports.

## How It Works

```
Query → Generate search queries → Search web → Extract learnings
                                                       ↓
                                              Follow-up questions
                                                       ↓
                                              Recurse deeper (repeat)
                                                       ↓
                                              Synthesize report
```

1. Enter a topic with breadth (parallel queries) and depth (recursive levels)
2. AI generates targeted search queries for different facets of the topic
3. Firecrawl searches the web and extracts full-page markdown content
4. AI analyzes results, extracts learnings, and generates follow-up questions
5. Steps 2–4 repeat recursively at decreasing breadth
6. A comprehensive report is synthesized from all findings with source citations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript (strict) |
| AI | Vercel AI SDK with structured outputs (Zod) |
| Providers | OpenAI, Groq, OpenRouter |
| Search | Firecrawl (web search + markdown extraction) |
| Styling | Tailwind CSS v4 |
| UI | shadcn/ui + Radix |
| Linting | Biome |
| Runtime | Bun |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Firecrawl API key](https://firecrawl.dev) (required)
- At least one AI provider API key

### Setup

```bash
git clone https://github.com/your-username/researchpilot.git
cd researchpilot
bun install
cp .env.example .env
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FIRECRAWL_API_KEY` | Yes | Web search API key |
| `AI_PROVIDER` | No | `openai` (default), `groq`, or `openrouter` |
| `OPENAI_API_KEY` | If OpenAI | [Get key](https://platform.openai.com/api-keys) |
| `GROQ_API_KEY` | If Groq | [Get key](https://console.groq.com) |
| `OPENROUTER_API_KEY` | If OpenRouter | [Get key](https://openrouter.ai/keys) |
| `AI_MODEL` | No | Model override (smart defaults per provider) |
| `FIRECRAWL_CONCURRENCY` | No | Parallel search limit (default: 2) |
| `CONTEXT_SIZE` | No | Context window in tokens (default: 128000) |

### Running

```bash
bun dev          # Development with Turbopack
bun run build    # Production build
bun start        # Production server
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/research/
│   │   ├── route.ts              # POST /api/research (SSE streaming)
│   │   └── feedback/route.ts     # POST /api/research/feedback
│   ├── page.tsx                  # Research interface (single-page app)
│   ├── layout.tsx                # Root layout
│   └── not-found.tsx
├── components/
│   ├── layout/Header.tsx         # Minimal top bar
│   ├── ui/                       # shadcn/ui primitives
│   ├── research-form.tsx         # Query input + breadth/depth controls
│   ├── research-progress.tsx     # Real-time progress with query log
│   ├── research-report.tsx       # Markdown report with export
│   └── error-boundary.tsx
└── lib/
    ├── research/
    │   ├── engine.ts             # Recursive research algorithm
    │   ├── search.ts             # Firecrawl + rate limiting
    │   ├── providers.ts          # AI provider config (lazy init)
    │   ├── prompts.ts            # System & instruction prompts
    │   ├── feedback.ts           # Clarifying question generation
    │   ├── text-utils.ts         # Token counting + prompt trimming
    │   ├── types.ts              # Types + Zod schemas
    │   └── index.ts              # Public API
    └── utils.ts
```

## Scripts

```bash
bun dev              # Dev server (Turbopack)
bun run build        # Production build
bun run type-check   # TypeScript check
bun run check        # Biome lint + format (auto-fix)
bun run ci           # Biome check (CI, no fix)
bun run validate     # type-check + lint + build
```

## License

MIT
