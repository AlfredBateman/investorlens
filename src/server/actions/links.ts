import { db } from "@/lib/db";

// Not a "use server" file: exporting this from one would expose it as a public action.

export const INVALID_INTERVIEW_LINK = "A linked interview belongs to a different project.";

/** True when every interview id exists and belongs to `projectId`. */
export async function interviewsBelongToProject(projectId: string, interviewIds: string[]) {
  const ids = [...new Set(interviewIds)];
  if (!ids.length) return true;
  return (await db.interview.count({ where: { projectId, id: { in: ids } } })) === ids.length;
}
