"use server";

/**
 * src/server/actions/recommendation.ts
 *
 * Server Actions for Recommendation mutations (create, update, delete).
 * - Validated via Zod schemas.
 * - revalidatePath for live updates.
 * - redirect() is used on create/delete.
 * - projectId is always derived from the linked finding, never taken from the form.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createRecommendationSchema,
  updateRecommendationSchema,
} from "@/lib/validations/recommendation";
import type { ActionResult } from "./types";

export type { ActionResult } from "./types";

export async function createRecommendation(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    findingId: formData.get("findingId"),
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status") ?? "PROPOSED",
    priority: formData.get("priority") ?? "MEDIUM",
  };

  const parsed = createRecommendationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  let projectId: string;
  try {
    const finding = await db.finding.findUnique({
      where: { id: parsed.data.findingId },
      select: { projectId: true },
    });
    if (!finding) {
      return { error: { findingId: ["The selected finding no longer exists."] } };
    }
    projectId = finding.projectId;

    await db.recommendation.create({ data: { ...parsed.data, projectId } });
  } catch {
    return { message: "Failed to create recommendation. Please try again." };
  }

  revalidatePath("/recommendations");
  redirect(`/recommendations?projectId=${projectId}`);
}

export async function updateRecommendation(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    id: formData.get("id"),
    findingId: formData.get("findingId"),
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    priority: formData.get("priority"),
  };

  const parsed = updateRecommendationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // The linked finding (and therefore the project) is fixed after creation.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, findingId, ...data } = parsed.data;
  try {
    await db.recommendation.update({ where: { id }, data });
  } catch {
    return { message: "Failed to update recommendation. Please try again." };
  }

  revalidatePath("/recommendations");
  return { message: "Recommendation updated successfully.", success: true };
}

export async function deleteRecommendation(id: string, projectId: string): Promise<ActionResult> {
  const idParsed = z.string().uuid().safeParse(id);
  const projectParsed = z.string().uuid().safeParse(projectId);
  if (!idParsed.success || !projectParsed.success) {
    return { message: "Invalid ID." };
  }

  try {
    await db.recommendation.delete({ where: { id: idParsed.data } });
  } catch {
    return { message: "Failed to delete recommendation. It may have already been removed." };
  }

  revalidatePath("/recommendations");
  redirect(`/recommendations?projectId=${projectParsed.data}`);
}
