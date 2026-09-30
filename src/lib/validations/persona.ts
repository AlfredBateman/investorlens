/**
 * src/lib/validations/persona.ts
 *
 * Zod validation schemas for Persona forms.
 */

import { z } from "zod";

export const createPersonaSchema = z.object({
  projectId: z.string().uuid("A valid project must be selected."),
  name: z
    .string()
    .min(1, "Persona name is required.")
    .max(100, "Name must be 100 characters or fewer."),
  role: z
    .string()
    .min(1, "Role is required.")
    .max(100, "Role must be 100 characters or fewer."),
  avatarUrl: z.string().url("Must be a valid URL.").optional().nullable(),
  ageRange: z.string().max(50, "Age range must be 50 characters or fewer.").optional().nullable(),
  occupation: z.string().max(100, "Occupation must be 100 characters or fewer.").optional().nullable(),
  goals: z.string().min(1, "Goals are required."),
  frustrations: z.string().min(1, "Frustrations are required."),
  interviewIds: z.array(z.string().uuid()).optional(),
});

export const updatePersonaSchema = createPersonaSchema.extend({
  id: z.string().uuid("Invalid persona ID."),
});
