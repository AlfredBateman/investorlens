/**
 * src/server/queries/journeyMap.ts
 *
 * Read-only database queries for Journey Maps.
 *
 * `getJourneyMapById` is wrapped in React's `cache()` to avoid duplicate
 * DB queries when both `generateMetadata` and the page component use it.
 */

import { cache } from "react";
import { db } from "@/lib/db";

/** Returns all journey maps for a project with their ordered stages (card previews and the report). */
export async function getJourneyMapsByProject(projectId: string) {
  return db.journeyMap.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      stages: {
        orderBy: { position: "asc" },
        select: { id: true, name: true, description: true, painType: true, frictionRating: true },
      },
    },
  });
}

/** Returns a single journey map with its ordered stages and each stage's linked findings and personas. */
export const getJourneyMapById = cache(async (id: string) => {
  return db.journeyMap.findUnique({
    where: { id },
    include: {
      project: true,
      stages: {
        orderBy: { position: "asc" },
        include: {
          findings: { select: { id: true, title: true, severity: true } },
          personas: { select: { id: true, name: true } },
        },
      },
    },
  });
});
