"use server";

/**
 * src/server/actions/persona.ts
 *
 * Server Actions for Persona mutations (create, update, delete).
 * - Validated via shared Zod schemas before any DB call.
 * - revalidatePath busts the Next.js cache so RSC pages re-render with fresh data.
 * - redirect() is used after create/delete to navigate the user to the right page.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createPersonaSchema, updatePersonaSchema } from "@/lib/validations/persona";
import type { ActionResult } from "./types";

export type { ActionResult } from "./types";

export async function createPersona(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    projectId: formData.get("projectId"),
    name: formData.get("name"),
    role: formData.get("role"),
    avatarUrl: formData.get("avatarUrl") || null,
    ageRange: formData.get("ageRange") || null,
    occupation: formData.get("occupation") || null,
    goals: formData.get("goals"),
    frustrations: formData.get("frustrations"),
    interviewIds: formData.getAll("interviewIds").map(String),
  };

  const parsed = createPersonaSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { interviewIds: ids, ...personaData } = parsed.data;

  let personaId: string;
  try {
    const persona = await db.persona.create({
      data: {
        ...personaData,
        ...(ids?.length && {
          interviews: {
            create: ids.map((interviewId) => ({ interviewId })),
          },
        }),
      },
    });
    personaId = persona.id;
  } catch {
    return { message: "Failed to create persona. Please try again." };
  }

  revalidatePath(`/projects/${personaData.projectId}`);
  revalidatePath("/personas");
  redirect(`/personas/${personaId}`);
}

export async function updatePersona(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    id: formData.get("id"),
    projectId: formData.get("projectId"),
    name: formData.get("name"),
    role: formData.get("role"),
    avatarUrl: formData.get("avatarUrl") || null,
    ageRange: formData.get("ageRange") || null,
    occupation: formData.get("occupation") || null,
    goals: formData.get("goals"),
    frustrations: formData.get("frustrations"),
    interviewIds: formData.getAll("interviewIds").map(String),
  };

  const parsed = updatePersonaSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { id, interviewIds: ids, ...personaData } = parsed.data;

  try {
    // Atomic transaction: clear old junction rows, then insert new ones
    await db.$transaction([
      db.personaInterview.deleteMany({ where: { personaId: id } }),
      db.persona.update({
        where: { id },
        data: {
          ...personaData,
          ...(ids?.length && {
            interviews: {
              create: ids.map((interviewId) => ({ interviewId })),
            },
          }),
        },
      }),
    ]);
  } catch {
    return { message: "Failed to update persona. Please try again." };
  }

  revalidatePath(`/personas/${id}`);
  revalidatePath(`/projects/${personaData.projectId}`);
  revalidatePath("/personas");

  return { message: "Persona updated successfully.", success: true };
}

export async function deletePersona(id: string, projectId: string): Promise<ActionResult> {
  const idParsed = z.string().uuid().safeParse(id);
  const projectParsed = z.string().uuid().safeParse(projectId);
  if (!idParsed.success || !projectParsed.success) {
    return { message: "Invalid ID." };
  }

  try {
    await db.persona.delete({ where: { id: idParsed.data } });
  } catch {
    return { message: "Failed to delete persona. It may have already been removed." };
  }

  revalidatePath(`/projects/${projectParsed.data}`);
  revalidatePath("/personas");
  redirect(`/personas?projectId=${projectParsed.data}`);
}
