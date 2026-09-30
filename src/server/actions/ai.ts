"use server";

/**
 * src/server/actions/ai.ts
 *
 * AI transcript extraction (opt-in, see src/lib/flags.ts).
 * - extractSuggestions: sends a transcript to Gemini and returns reviewable
 *   suggestions. Writes nothing.
 * - applySuggestions: saves only the suggestions the researcher approved,
 *   after re-validating every id against the project.
 */

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { FindingCategory, SeverityLevel } from "@prisma/client";
import { db } from "@/lib/db";
import { aiEnabled } from "@/lib/flags";
import { generateJson } from "@/server/ai/gemini";
import { buildPrompt, PAIN_POINT_SCHEMA, toSuggestions, type Suggestion } from "@/server/ai/transcript";
import type { ActionResult } from "./types";

export type ExtractState = ActionResult & {
  suggestions?: Suggestion[];
  /** New per run, so the review UI remounts with fresh decisions. */
  runId?: string;
};

const DISABLED = "AI features are disabled. Set AI_FEATURES=on in .env to enable them.";

const extractSchema = z.object({
  projectId: z.string().uuid("Select a project."),
  interviewId: z.string().uuid().nullable(),
  transcript: z
    .string()
    .trim()
    .min(50, "Paste at least a few sentences of transcript.")
    .max(60_000, "Transcripts are limited to 60,000 characters."),
});

export async function extractSuggestions(_prev: ExtractState | null, formData: FormData): Promise<ExtractState> {
  if (!aiEnabled()) return { message: DISABLED };

  const parsed = extractSchema.safeParse({
    projectId: formData.get("projectId"),
    interviewId: formData.get("interviewId") || null,
    transcript: formData.get("transcript") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const { projectId, interviewId, transcript } = parsed.data;

  const [findings, interview] = await Promise.all([
    db.finding.findMany({ where: { projectId }, select: { id: true, title: true, description: true } }),
    interviewId ? db.interview.findFirst({ where: { id: interviewId, projectId }, select: { id: true } }) : null,
  ]);
  if (interviewId && !interview) return { error: { interviewId: ["That interview isn't in this project."] } };

  try {
    const raw = await generateJson(buildPrompt(transcript, findings), PAIN_POINT_SCHEMA);
    const suggestions = toSuggestions(raw, transcript, new Set(findings.map((f) => f.id)));
    return {
      suggestions,
      runId: randomUUID(),
      message: suggestions.length ? undefined : "No pain points were found in this transcript.",
    };
  } catch (e) {
    const detail = e instanceof z.ZodError ? "Gemini's answer didn't match the expected format." : (e as Error).message;
    return { message: `Extraction failed. ${detail}` };
  }
}

const decisionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("match"), findingId: z.string().uuid(), quote: z.string().min(1).max(2000) }),
  z.object({
    kind: z.literal("new"),
    title: z.string().trim().min(1, "Every new finding needs a title.").max(200),
    description: z.string().min(1).max(10_000),
    category: z.enum(FindingCategory),
    severity: z.enum(SeverityLevel),
  }),
]);

const applySchema = z.object({
  projectId: z.string().uuid(),
  interviewId: z.string().uuid().nullable(),
  decisions: z.array(decisionSchema).min(1, "Approve at least one suggestion first.").max(50),
});

export async function applySuggestions(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!aiEnabled()) return { message: DISABLED };

  let decisions: unknown;
  try {
    decisions = JSON.parse(String(formData.get("decisionsJson") ?? "[]"));
  } catch {
    return { message: "Decision data was malformed. Please try again." };
  }

  const parsed = applySchema.safeParse({
    projectId: formData.get("projectId"),
    interviewId: formData.get("interviewId") || null,
    decisions,
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { message: first ?? "Invalid suggestions." };
  }
  const { projectId, interviewId } = parsed.data;
  const matches = parsed.data.decisions.filter((d) => d.kind === "match");
  const creates = parsed.data.decisions.filter((d) => d.kind === "new");

  try {
    const [targets, interview] = await Promise.all([
      db.finding.findMany({
        where: { projectId, id: { in: [...new Set(matches.map((m) => m.findingId))] } },
        select: { id: true, description: true },
      }),
      interviewId
        ? db.interview.findFirst({ where: { id: interviewId, projectId }, select: { candidateName: true } })
        : null,
    ]);
    if (targets.length !== new Set(matches.map((m) => m.findingId)).size || (interviewId && !interview)) {
      return { message: "A suggestion points at a finding or interview outside this project." };
    }

    // ponytail: supporting quotes are appended to the finding's description; add a FindingEvidence
    // table if quotes ever need to be listed, counted or removed individually.
    const source = interview ? ` (${interview.candidateName})` : "";
    const descriptions = new Map(targets.map((t) => [t.id, t.description]));
    for (const m of matches) {
      descriptions.set(m.findingId, `${descriptions.get(m.findingId)}\n\nSupporting quote${source}: "${m.quote}"`);
    }

    await db.$transaction([
      ...[...descriptions].map(([id, description]) => db.finding.update({ where: { id }, data: { description } })),
      ...creates.map((c) =>
        db.finding.create({
          data: {
            title: c.title,
            description: c.description,
            category: c.category,
            severity: c.severity,
            projectId,
            interviewId,
          },
        })
      ),
    ]);
  } catch {
    return { message: "Failed to save the approved suggestions. Nothing was changed." };
  }

  revalidatePath("/findings");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/findings?projectId=${projectId}`);
}
