/**
 * src/app/robots.ts
 *
 * Generates the robots.txt file for search engine crawlers.
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
  };
}
