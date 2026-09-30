/**
 * src/server/queries/project.ts
 *
 * Read-only database queries for Projects.
 *
 * These functions are called exclusively from React Server Components (RSCs).
 * They have direct access to the Prisma client and never expose any mutation
 * logic. They return plain serialisable objects safe for use as RSC props.
 */

import { db } from "@/lib/db";
import type { ProjectWithCounts } from "@/types";

/** Returns all projects with their relational counts for the sidebar and list views. */
export async function getAllProjects(): Promise<ProjectWithCounts[]> {
  return db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { interviews: true, findings: true, personas: true, recommendations: true, journeyMaps: true } } },
  });
}

/** Returns a single project by ID with full relational counts. */
export async function getProjectById(id: string): Promise<ProjectWithCounts | null> {
  return db.project.findUnique({
    where: { id },
    include: { _count: { select: { interviews: true, findings: true, personas: true, recommendations: true, journeyMaps: true } } },
  });
}
