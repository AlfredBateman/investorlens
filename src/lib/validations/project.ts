/**
 * src/lib/validations/project.ts
 *
 * Zod validation schemas for Project forms.
 *
 * Used by the project Server Actions to validate submitted form data.
 */

import { z } from "zod";
import { ProjectStatus } from "@prisma/client";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required.")
    .max(100, "Project name must be 100 characters or fewer."),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer.")
    .optional(),
});

export const updateProjectSchema = createProjectSchema.extend({
  id: z.string().uuid("Invalid project ID."),
  status: z.enum(ProjectStatus).optional(),
});
