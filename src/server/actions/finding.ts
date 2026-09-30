"use server";

/**
 * src/server/actions/finding.ts
 *
 * Server Actions for Finding mutations (create, update, delete).
 * - Validated via shared Zod schemas before any DB call.
 * - revalidatePath busts the Next.js cache so RSC pages re-render with fresh data.
 * - redirect() is used after create/delete to navigate the user to the right page.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createFindingSchema, updateFindingSchema } from "@/lib/validations/finding";
import { INVALID_INTERVIEW_LINK, interviewsBelongToProject } from "./links";
import type { ActionResult } from "./types";

export type { ActionResult } from "./types";

export async function createFinding(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    projectId: formData.get("projectId"),
    interviewId: formData.get("interviewId") || null,
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    severity: formData.get("severity"),
  };

  const parsed = createFindingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  let findingId: string;
  try {
    const { projectId, interviewId } = parsed.data;
    if (interviewId && !(await interviewsBelongToProject(projectId, [interviewId]))) {
      return { message: INVALID_INTERVIEW_LINK };
    }
    const finding = await db.finding.create({ data: parsed.data });
    findingId = finding.id;
  } catch {
    return { message: "Failed to create finding. Please try again." };
  }

  revalidatePath(`/projects/${parsed.data.projectId}`);
  revalidatePath("/findings");
  redirect(`/findings/${findingId}`);
}

export async function updateFinding(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    id: formData.get("id"),
    projectId: formData.get("projectId"),
    interviewId: formData.get("interviewId") || null,
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    severity: formData.get("severity"),
  };

  const parsed = updateFindingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // The finding's project is fixed after creation; trust the DB, not the hidden field.
  const { id, ...fields } = parsed.data;
  let projectId: string;
  try {
    const existing = await db.finding.findUnique({ where: { id }, select: { projectId: true } });
    if (!existing) {
      return { message: "This finding no longer exists." };
    }
    projectId = existing.projectId;
    if (fields.interviewId && !(await interviewsBelongToProject(projectId, [fields.interviewId]))) {
      return { message: INVALID_INTERVIEW_LINK };
    }
    await db.finding.update({ where: { id }, data: { ...fields, projectId } });
  } catch {
    return { message: "Failed to update finding. Please try again." };
  }

  revalidatePath("/findings");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/findings/${id}`);

  return { message: "Finding updated successfully.", success: true };
}

export async function deleteFinding(id: string, projectId: string): Promise<ActionResult> {
  const idParsed = z.string().uuid().safeParse(id);
  const projectParsed = z.string().uuid().safeParse(projectId);
  if (!idParsed.success || !projectParsed.success) {
    return { message: "Invalid ID." };
  }

  try {
    await db.finding.delete({ where: { id: idParsed.data } });
  } catch {
    return { message: "Failed to delete finding. It may have already been removed." };
  }

  revalidatePath("/findings");
  revalidatePath(`/projects/${projectParsed.data}`);
  redirect(`/findings?projectId=${projectParsed.data}`);
}
