/**
 * src/app/sitemap.ts
 *
 * Generates the sitemap.xml for search engine indexing.
 * Lists the main application routes for discoverability.
 */

import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://investorlens.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/dashboard",
    "/search",
    "/projects",
    "/interviews",
    "/findings",
    "/personas",
    "/recommendations",
    "/journey-maps",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "/dashboard" ? 1 : 0.8,
  }));
}
