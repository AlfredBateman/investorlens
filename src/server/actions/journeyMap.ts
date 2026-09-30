"use server";

/**
 * src/server/actions/journeyMap.ts
 *
 * Server Actions for Journey Map mutations (create, update, delete).
 * - Validated via shared Zod schemas before any DB call.
 * - Stages arrive as one JSON string field (`stagesJson`, written by
 *   JourneyMapForm) since FormData can't carry a nested array natively.
 * - Every finding/persona a stage links to must belong to the map's project.
 * - revalidatePath busts the Next.js cache so RSC pages re-render with fresh data.
 * - redirect() is used after create/delete to navigate the user to the right page.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createJourneyMapSchema,
  updateJourneyMapSchema,
  type JourneyStageInput,
} from "@/lib/validations/journeyMap";
import type { ActionResult } from "./types";

export type { ActionResult } from "./types";

function parseStages(formData: FormData): unknown {
  try {
    return JSON.parse(String(formData.get("stagesJson") ?? "[]"));
  } catch {
    return null;
  }
}

/** True when every linked finding and persona belongs to `projectId`. */
async function linksBelongToProject(projectId: string, stages: JourneyStageInput[]) {
  const findingIds = [...new Set(stages.flatMap((s) => s.findingIds))];
  const personaIds = [...new Set(stages.flatMap((s) => s.personaIds))];
  const [findings, personas] = await Promise.all([
    db.finding.count({ where: { projectId, id: { in: findingIds } } }),
    db.persona.count({ where: { projectId, id: { in: personaIds } } }),
  ]);
  return findings === findingIds.length && personas === personaIds.length;
}

function toStageCreate({ findingIds, personaIds, ...stage }: JourneyStageInput, position: number) {
  return {
    ...stage,
    position,
    findings: { connect: findingIds.map((id) => ({ id })) },
    personas: { connect: personaIds.map((id) => ({ id })) },
  };
}

const INVALID_LINKS = "A stage links to a finding or persona from another project.";

export async function createJourneyMap(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const stages = parseStages(formData);
  if (stages === null) {
    return { message: "Stage data was malformed. Please try again." };
  }

  const parsed = createJourneyMapSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    stages,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { stages: stageInputs, ...mapData } = parsed.data;

  let mapId: string;
  try {
    if (!(await linksBelongToProject(mapData.projectId, stageInputs))) {
      return { message: INVALID_LINKS };
    }
    const map = await db.journeyMap.create({
      data: { ...mapData, stages: { create: stageInputs.map(toStageCreate) } },
    });
    mapId = map.id;
  } catch {
    return { message: "Failed to create journey map. Please try again." };
  }

  revalidatePath(`/projects/${mapData.projectId}`);
  revalidatePath("/journey-maps");
  redirect(`/journey-maps/${mapId}`);
}

export async function updateJourneyMap(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const stages = parseStages(formData);
  if (stages === null) {
    return { message: "Stage data was malformed. Please try again." };
  }

  const parsed = updateJourneyMapSchema.safeParse({
    id: formData.get("id"),
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    stages,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // The map's project is fixed after creation; trust the DB, not the hidden field.
  const { id, title, description, stages: stageInputs } = parsed.data;
  let projectId: string;
  try {
    const existing = await db.journeyMap.findUnique({ where: { id }, select: { projectId: true } });
    if (!existing) {
      return { message: "This journey map no longer exists." };
    }
    projectId = existing.projectId;
    if (!(await linksBelongToProject(projectId, stageInputs))) {
      return { message: INVALID_LINKS };
    }

    // Atomic: clear old stages (their link rows go with them), then insert the current list in order.
    await db.$transaction([
      db.journeyStage.deleteMany({ where: { journeyMapId: id } }),
      db.journeyMap.update({
        where: { id },
        data: { title, description: description ?? null, stages: { create: stageInputs.map(toStageCreate) } },
      }),
    ]);
  } catch {
    return { message: "Failed to update journey map. Please try again." };
  }

  revalidatePath(`/journey-maps/${id}`);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/journey-maps");

  return { message: "Journey map updated successfully.", success: true };
}

export async function deleteJourneyMap(id: string, projectId: string): Promise<ActionResult> {
  const idParsed = z.string().uuid().safeParse(id);
  const projectParsed = z.string().uuid().safeParse(projectId);
  if (!idParsed.success || !projectParsed.success) {
    return { message: "Invalid ID." };
  }

  try {
    await db.journeyMap.delete({ where: { id: idParsed.data } });
  } catch {
    return { message: "Failed to delete journey map. It may have already been removed." };
  }

  revalidatePath(`/projects/${projectParsed.data}`);
  revalidatePath("/journey-maps");
  redirect(`/journey-maps?projectId=${projectParsed.data}`);
}
