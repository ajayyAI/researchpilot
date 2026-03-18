import type { MetadataRoute } from "next";
import { createAbsoluteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: createAbsoluteUrl("/sitemap.xml"),
    host: createAbsoluteUrl(),
  };
}
