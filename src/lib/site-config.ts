export const DEFAULT_SITE_URL = "http://localhost:3000";

export const siteConfig = {
  name: "ResearchPilot",
  shortName: "ResearchPilot",
  githubUrl: "https://github.com/ajayyAI/researchpilot",
  description:
    "AI-powered deep research that recursively searches the web, verifies sources, and produces structured reports you can act on.",
  keywords: [
    "AI research",
    "deep research",
    "research assistant",
    "source-backed reports",
    "web research",
    "recursive search",
  ],
  themeColor: "#161616",
  backgroundColor: "#161616",
  accentColor: "#d97706",
} as const;

export function normalizeSiteUrl(rawUrl?: string): string {
  if (!rawUrl) {
    return DEFAULT_SITE_URL;
  }

  try {
    const url = new URL(rawUrl);
    const normalizedPath = url.pathname.replace(/\/+$/, "");
    url.pathname = normalizedPath || "/";

    const normalized = url.toString();
    return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function getSiteUrl(): URL {
  return new URL(
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL),
  );
}

export function createAbsoluteUrl(path = "/"): string {
  return new URL(path, getSiteUrl()).toString();
}
