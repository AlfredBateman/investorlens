"use server";

/**
 * src/server/actions/interview.ts
 *
 * Server Actions for Interview mutations (create, update, delete).
 * - Validated via shared Zod schemas before any DB call.
 * - revalidatePath busts the Next.js cache so RSC pages re-render with fresh data.
 * - redirect() is used after create/delete to navigate the user to the right page.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createInterviewSchema, updateInterviewSchema } from "@/lib/validations/interview";
import type { ActionResult } from "./types";

export type { ActionResult } from "./types";

export async function createInterview(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    projectId: formData.get("projectId"),
    candidateName: formData.get("candidateName"),
    candidateRole: formData.get("candidateRole") || undefined,
    candidateCompany: formData.get("candidateCompany") || undefined,
    age: formData.get("age"),
    platform: formData.get("platform"),
    investingBehavior: formData.get("investingBehavior") || undefined,
    goals: formData.get("goals") || undefined,
    frustrations: formData.get("frustrations") || undefined,
    dateConducted: formData.get("dateConducted"),
    notesText: formData.get("notesText"),
  };

  const parsed = createInterviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  let interviewId: string;
  try {
    const interview = await db.interview.create({ data: parsed.data });
    interviewId = interview.id;
  } catch {
    return { message: "Failed to create interview. Please try again." };
  }

  revalidatePath(`/projects/${parsed.data.projectId}`);
  revalidatePath("/interviews");
  redirect(`/interviews/${interviewId}`);
}

export async function updateInterview(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    id: formData.get("id"),
    projectId: formData.get("projectId"),
    candidateName: formData.get("candidateName"),
    candidateRole: formData.get("candidateRole") || null,
    candidateCompany: formData.get("candidateCompany") || null,
    age: formData.get("age"),
    platform: formData.get("platform"),
    investingBehavior: formData.get("investingBehavior") || null,
    goals: formData.get("goals") || null,
    frustrations: formData.get("frustrations") || null,
    dateConducted: formData.get("dateConducted"),
    notesText: formData.get("notesText"),
  };

  const parsed = updateInterviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // The interview's project is fixed after creation; trust the DB, not the hidden field.
  const { id, ...data } = parsed.data;
  let projectId: string;
  try {
    const existing = await db.interview.findUnique({ where: { id }, select: { projectId: true } });
    if (!existing) {
      return { message: "This interview no longer exists." };
    }
    projectId = existing.projectId;
    await db.interview.update({ where: { id }, data: { ...data, projectId } });
  } catch {
    return { message: "Failed to update interview. Please try again." };
  }

  revalidatePath(`/interviews/${id}`);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/interviews");

  return { message: "Interview updated successfully.", success: true };
}

export async function deleteInterview(id: string, projectId: string): Promise<ActionResult> {
  const idParsed = z.string().uuid().safeParse(id);
  const projectParsed = z.string().uuid().safeParse(projectId);
  if (!idParsed.success || !projectParsed.success) {
    return { message: "Invalid ID." };
  }

  try {
    await db.interview.delete({ where: { id: idParsed.data } });
  } catch {
    return { message: "Failed to delete interview. It may have already been removed." };
  }

  revalidatePath(`/projects/${projectParsed.data}`);
  revalidatePath("/interviews");
  redirect(`/interviews?projectId=${projectParsed.data}`);
}
