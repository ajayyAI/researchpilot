import type { MetadataRoute } from "next";
import { createAbsoluteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: createAbsoluteUrl(),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
