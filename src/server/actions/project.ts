"use server";

/**
 * src/server/actions/project.ts
 *
 * Server Actions for Project mutations.
 * - Validated via shared Zod schemas before any DB call.
 * - revalidatePath busts the Next.js cache so RSC pages re-render with fresh data.
 * - redirect() is used after create/delete to navigate the user to the right page.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createProjectSchema, updateProjectSchema } from "@/lib/validations/project";
import type { ActionResult } from "./types";

export type { ActionResult } from "./types";

export async function createProject(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
  };

  const parsed = createProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  let projectId: string;
  try {
    const project = await db.project.create({ data: parsed.data });
    projectId = project.id;
  } catch {
    return { message: "Failed to create project. Please try again." };
  }

  revalidatePath("/projects");
  redirect(`/projects/${projectId}`);
}

export async function updateProject(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description"),
    status: formData.get("status"),
  };

  const parsed = updateProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { id, ...data } = parsed.data;
  try {
    await db.project.update({ where: { id }, data });
  } catch {
    return { message: "Failed to update project. Please try again." };
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { message: "Project updated successfully.", success: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) {
    return { message: "Invalid project ID." };
  }

  try {
    await db.project.delete({ where: { id: parsed.data } });
  } catch {
    return { message: "Failed to delete project. It may have already been removed." };
  }

  revalidatePath("/projects");
  redirect("/projects");
}
