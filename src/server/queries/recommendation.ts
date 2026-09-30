/**
 * src/server/queries/recommendation.ts
 *
 * Read-only database queries for Recommendations.
 *
 * `getRecommendationById` is wrapped in React's `cache()` to avoid duplicate
 * DB queries when both `generateMetadata` and the page component use it.
 */

import { cache } from "react";
import { db } from "@/lib/db";
import type { RecommendationPriority, RecommendationStatus } from "@/types";

type RecommendationFilters = {
  priority?: RecommendationPriority;
  status?: RecommendationStatus;
  /** Matches against title or description. */
  search?: string;
};

/** Returns all recommendations for a project, grouped by their finding, with optional priority/status/text filters. */
export async function getRecommendationsByProject(projectId: string, filters?: RecommendationFilters) {
  return db.recommendation.findMany({
    where: {
      projectId,
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search } },
          { description: { contains: filters.search } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      finding: { select: { id: true, title: true, severity: true } },
    },
  });
}

/** Returns a single recommendation by ID with its finding and project context. */
export const getRecommendationById = cache(async (id: string) => {
  return db.recommendation.findUnique({
    where: { id },
    include: {
      finding: {
        include: {
          project: true,
        },
      },
    },
  });
});
