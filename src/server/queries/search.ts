/**
 * src/server/queries/search.ts
 *
 * Cross-entity search within a single project: interviews, findings,
 * personas and recommendations, each matched on their own text fields.
 * Everything is scoped to a project, consistent with the rest of the app.
 */

import { db } from "@/lib/db";

const TAKE = 20;

export async function searchProject(projectId: string, query: string) {
  const q = query.trim();
  if (!q) {
    return { interviews: [], findings: [], personas: [], recommendations: [] };
  }

  const [interviews, findings, personas, recommendations] = await Promise.all([
    db.interview.findMany({
      where: {
        projectId,
        OR: [
          { candidateName: { contains: q } },
          { candidateRole: { contains: q } },
          { candidateCompany: { contains: q } },
          { notesText: { contains: q } },
        ],
      },
      orderBy: { dateConducted: "desc" },
      select: { id: true, candidateName: true, candidateRole: true, candidateCompany: true, dateConducted: true },
      take: TAKE,
    }),
    db.finding.findMany({
      where: {
        projectId,
        OR: [{ title: { contains: q } }, { description: { contains: q } }],
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, description: true, category: true, severity: true },
      take: TAKE,
    }),
    db.persona.findMany({
      where: {
        projectId,
        OR: [
          { name: { contains: q } },
          { role: { contains: q } },
          { occupation: { contains: q } },
          { goals: { contains: q } },
          { frustrations: { contains: q } },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, role: true },
      take: TAKE,
    }),
    db.recommendation.findMany({
      where: {
        projectId,
        OR: [{ title: { contains: q } }, { description: { contains: q } }],
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, description: true, status: true, priority: true },
      take: TAKE,
    }),
  ]);

  return { interviews, findings, personas, recommendations };
}

export type SearchResults = Awaited<ReturnType<typeof searchProject>>;
