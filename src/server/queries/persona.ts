/**
 * src/server/queries/persona.ts
 *
 * Read-only database queries for Personas.
 *
 * `getPersonaById` is wrapped in React's `cache()` to avoid duplicate
 * DB queries when both `generateMetadata` and the page component use it.
 */

import { cache } from "react";
import { db } from "@/lib/db";
import type { Persona } from "@/types";

type PersonaWithInterviewCount = Persona & { _count: { interviews: number } };

/** Returns all personas for a project, with an optional text filter across name/role/occupation/goals/frustrations. */
export async function getPersonasByProject(
  projectId: string,
  search?: string
): Promise<PersonaWithInterviewCount[]> {
  return db.persona.findMany({
    where: {
      projectId,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { role: { contains: search } },
          { occupation: { contains: search } },
          { goals: { contains: search } },
          { frustrations: { contains: search } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { interviews: true } } },
  });
}

/** Returns a single persona with its linked relationships (project, source interviews). */
export const getPersonaById = cache(async (id: string) => {
  return db.persona.findUnique({
    where: { id },
    include: {
      project: true,
      interviews: {
        include: {
          interview: {
            select: {
              id: true,
              candidateName: true,
              candidateRole: true,
              candidateCompany: true,
              dateConducted: true,
            },
          },
        },
      },
    },
  });
});
