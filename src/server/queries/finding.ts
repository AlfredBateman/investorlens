/**
 * src/server/queries/finding.ts
 *
 * Read-only database queries for Findings.
 *
 * `getFindingById` is wrapped in React's `cache()` so that when both
 * `generateMetadata` and the page component call it with the same ID
 * in a single request, the database query only executes once.
 */

import { cache } from "react";
import { db } from "@/lib/db";
import { SeverityLevel } from "@prisma/client";
import type { Finding, FindingCategory } from "@/types";

// Enum declaration order is LOW..CRITICAL; SQL can only sort the stored text alphabetically.
const SEVERITY_RANK = Object.fromEntries(Object.values(SeverityLevel).map((s, i) => [s, i]));

type FindingWithRecommendationCount = Finding & { _count: { recommendations: number } };

type FindingFilters = {
  category?: FindingCategory;
  severity?: SeverityLevel;
  /** Only findings sourced from an interview linked to this persona. */
  personaId?: string;
  /** Matches against title or description. */
  search?: string;
};

/** Returns a project's findings, most severe first, with optional category/severity/persona/text filters. */
export async function getFindingsByProject(
  projectId: string,
  filters?: FindingFilters
): Promise<FindingWithRecommendationCount[]> {
  const findings = await db.finding.findMany({
    where: {
      projectId,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.severity && { severity: filters.severity }),
      ...(filters?.personaId && {
        interview: { personas: { some: { personaId: filters.personaId } } },
      }),
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search } },
          { description: { contains: filters.search } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { recommendations: true } } },
  });
  // Stable sort keeps newest-first within each severity.
  return findings.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);
}

/** Returns a single finding with all its linked relationships (project, interview, recommendations). */
export const getFindingById = cache(async (id: string) => {
  return db.finding.findUnique({
    where: { id },
    include: {
      project: true,
      interview: true,
      recommendations: { orderBy: { createdAt: "desc" } },
    },
  });
});
