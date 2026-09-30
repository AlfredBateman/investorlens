/**
 * src/lib/validations/journeyMap.ts
 *
 * Zod validation schemas for Journey Map forms.
 *
 * A map's stages are edited as a dynamic, ordered list in the client form and
 * submitted as one JSON string (see JourneyMapForm) rather than as indexed
 * form fields, since FormData has no native support for nested arrays.
 */

import { z } from "zod";
import { PainPointType } from "@prisma/client";
import { FRICTION_MAX } from "@/lib/friction";

export const journeyStageSchema = z.object({
  name: z.string().min(1, "Every stage needs a name.").max(100, "Stage names must be 100 characters or fewer."),
  description: z.string().max(2000, "Stage descriptions must be 2,000 characters or fewer.").optional(),
  painType: z.enum(PainPointType).optional().nullable(),
  frictionRating: z.number().int().min(0).max(FRICTION_MAX),
  findingIds: z.array(z.string().uuid()).max(50),
  personaIds: z.array(z.string().uuid()).max(50),
});

export const createJourneyMapSchema = z.object({
  projectId: z.string().uuid("A valid project must be selected."),
  title: z.string().min(1, "Title is required.").max(200, "Title must be 200 characters or fewer."),
  description: z.string().max(2000, "Description must be 2,000 characters or fewer.").optional(),
  stages: z
    .array(journeyStageSchema)
    .min(1, "Add at least one stage.")
    .max(20, "A journey map can have at most 20 stages."),
});

export const updateJourneyMapSchema = createJourneyMapSchema.extend({
  id: z.string().uuid("Invalid journey map ID."),
});

export type JourneyStageInput = z.infer<typeof journeyStageSchema>;
