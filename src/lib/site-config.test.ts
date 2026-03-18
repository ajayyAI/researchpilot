import { describe, expect, test } from "bun:test";
import {
  createAbsoluteUrl,
  DEFAULT_SITE_URL,
  normalizeSiteUrl,
} from "@/lib/site-config";

describe("site-config", () => {
  test("falls back to the default site URL when unset", () => {
    expect(normalizeSiteUrl(undefined)).toBe(DEFAULT_SITE_URL);
  });

  test("trims a trailing slash from configured site URLs", () => {
    expect(normalizeSiteUrl("https://researchpilot.dev/")).toBe(
      "https://researchpilot.dev",
    );
  });

  test("creates absolute URLs from relative paths", () => {
    expect(createAbsoluteUrl("/manifest.webmanifest")).toBe(
      "https://researchpilot.dev/manifest.webmanifest",
    );
  });
});
