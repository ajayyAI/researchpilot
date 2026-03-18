# ResearchPilot

AI-powered deep research assistant that recursively searches the web, extracts key insights, and synthesizes comprehensive reports on any topic.

## How It Works

ResearchPilot uses a **recursive depth-first search** algorithm powered by LLMs:

```
Query -> Generate SERP queries -> Search web -> Extract learnings
                                                       |
                                                       v
                                              Follow-up questions
                                                       |
                                                       v
                                              Recurse deeper (repeat)
                                                       |
                                                       v
                                              Synthesize final report
```

1. **You enter a topic** and configure breadth (parallel queries) and depth (recursive levels)
2. **The AI generates search queries** tailored to explore different facets of your topic
3. **Firecrawl searches the web** and extracts full-page markdown content
4. **The AI analyzes results**, pulls out key learnings, and generates follow-up questions
5. **Steps 2-4 repeat recursively** at decreasing breadth, going deeper with each level
6. **A comprehensive report** is synthesized from all accumulated learnings with source citations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React 19) |
| Language | TypeScript (strict mode) |
| AI | [Vercel AI SDK](https://sdk.vercel.ai) with structured outputs via Zod |
| Providers | OpenAI, Groq, OpenRouter (configurable) |
| Search | [Firecrawl](https://firecrawl.dev) (web search + markdown extraction) |
| Styling | Tailwind CSS v4, Framer Motion |
| UI | [shadcn/ui](https://ui.shadcn.com) + Radix UI |
| Linting | [Biome](https://biomejs.dev) (lint + format) |
| Package Manager | [Bun](https://bun.sh) |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- A [Firecrawl API key](https://firecrawl.dev) (required for web search)
- At least one AI provider API key (see below)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/researchpilot.git
cd researchpilot

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env
```

### Environment Variables

Edit `.env` with your API keys:

| Variable | Required | Description |
|----------|----------|-------------|
| `FIRECRAWL_API_KEY` | Yes | Firecrawl API key for web search |
| `AI_PROVIDER` | No | `openai` (default), `groq`, or `openrouter` |
| `OPENAI_API_KEY` | If using OpenAI | [Get key](https://platform.openai.com/api-keys) |
| `GROQ_API_KEY` | If using Groq | [Get key](https://console.groq.com) (free tier) |
| `OPENROUTER_API_KEY` | If using OpenRouter | [Get key](https://openrouter.ai/keys) (free models) |
| `AI_MODEL` | No | Model override (uses smart defaults per provider) |
| `FIRECRAWL_CONCURRENCY` | No | Parallel search limit (default: 2) |
| `CONTEXT_SIZE` | No | Model context window in tokens (default: 128000) |

> **Tip:** OpenRouter is recommended for hobby use — it offers 30+ free models with generous rate limits.

### Running

```bash
# Development (with Turbopack)
bun dev

# Production build
bun run build
bun start
```

Open [http://localhost:3000](http://localhost:3000) to access the app.

## Project Structure

```
src/
├── app/
│   ├── api/research/          # API routes (SSE streaming)
│   │   ├── route.ts           # POST /api/research - main research endpoint
│   │   └── feedback/route.ts  # POST /api/research/feedback - clarifying questions
│   ├── research/page.tsx      # Research interface (client component)
│   ├── page.tsx               # Landing page
│   ├── layout.tsx             # Root layout with metadata & error boundary
│   └── not-found.tsx          # 404 page
├── components/
│   ├── landing/               # Landing page sections
│   ├── layout/                # Header & Footer
│   ├── ui/                    # shadcn/ui primitives
│   ├── research-form.tsx      # Research configuration form
│   ├── research-progress.tsx  # Real-time progress display
│   ├── research-report.tsx    # Markdown report renderer
│   └── error-boundary.tsx     # React error boundary
└── lib/
    ├── research/
    │   ├── engine.ts          # Core recursive research algorithm
    │   ├── search.ts          # Firecrawl integration + rate limiting
    │   ├── providers.ts       # AI provider configuration (lazy init)
    │   ├── prompts.ts         # System & instruction prompts
    │   ├── feedback.ts        # Pre-research question generation
    │   ├── text-utils.ts      # Token counting & prompt trimming
    │   ├── types.ts           # TypeScript types & Zod schemas
    │   └── index.ts           # Public API exports
    └── utils.ts               # Shared utilities
```

## Scripts

```bash
bun dev              # Start dev server with Turbopack
bun run build        # Production build
bun start            # Start production server
bun run type-check   # TypeScript type checking
bun run lint         # Lint with Biome
bun run check        # Lint + format (auto-fix)
bun run ci           # Lint check (no auto-fix, for CI)
bun run validate     # Full validation: type-check + lint + build
bun run clean        # Remove .next build cache
```

## Architecture Decisions

- **Recursive depth-first search** — Each research level generates follow-up questions that become the next level's input, enabling the AI to go beyond surface-level results
- **Server-Sent Events (SSE)** — Real-time progress streaming from the API to the client without WebSocket complexity
- **Lazy provider initialization** — AI provider clients are only instantiated when first used, preventing crashes when unused provider keys are absent
- **Token-aware prompt trimming** — Uses tiktoken to count tokens and intelligently trim prompts before they exceed the context window
- **Concurrency control** — `p-limit` prevents overwhelming the Firecrawl API with too many parallel requests
- **Exponential backoff** — Automatic retry with increasing delays on rate-limit errors (429)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes and ensure checks pass: `bun run validate`
4. Commit with a descriptive message
5. Open a pull request

## License

MIT
