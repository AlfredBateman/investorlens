/**
 * src/server/queries/interview.ts
 *
 * Read-only database queries for Interviews.
 *
 * List queries never select `notesText`: it can be many kilobytes of markdown
 * per interview and no list view shows it. Only the detail page loads it.
 */

import { cache } from "react";
import type { InvestingPlatform } from "@prisma/client";
import { db } from "@/lib/db";

const LIST_SELECT = {
  id: true,
  projectId: true,
  candidateName: true,
  candidateRole: true,
  candidateCompany: true,
  age: true,
  platform: true,
  dateConducted: true,
  createdAt: true,
  updatedAt: true,
} as const;

type InterviewFilters = {
  platform?: InvestingPlatform;
  ageMin?: number;
  ageMax?: number;
  /** Matches against candidate name, role, company, or notes. */
  search?: string;
};

/** Returns all interviews for a project, with optional platform/age/text filters (notes excluded for performance). */
export async function getInterviewsByProject(projectId: string, filters?: InterviewFilters) {
  return db.interview.findMany({
    where: {
      projectId,
      ...(filters?.platform && { platform: filters.platform }),
      ...((filters?.ageMin !== undefined || filters?.ageMax !== undefined) && {
        age: {
          ...(filters.ageMin !== undefined && { gte: filters.ageMin }),
          ...(filters.ageMax !== undefined && { lte: filters.ageMax }),
        },
      }),
      ...(filters?.search && {
        OR: [
          { candidateName: { contains: filters.search } },
          { candidateRole: { contains: filters.search } },
          { candidateCompany: { contains: filters.search } },
          { notesText: { contains: filters.search } },
        ],
      }),
    },
    orderBy: { dateConducted: "desc" },
    select: LIST_SELECT,
  });
}

/** Returns a single interview with its full notes text and linked findings. */
export const getInterviewById = cache(async (id: string) => {
  return db.interview.findUnique({
    where: { id },
    include: {
      project: true,
      findings: { orderBy: { createdAt: "desc" } },
    },
  });
});

