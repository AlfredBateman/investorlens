/**
 * src/lib/validations/finding.ts
 *
 * Zod validation schemas for Finding forms.
 */

import { z } from "zod";
import { FindingCategory, SeverityLevel } from "@prisma/client";

export const createFindingSchema = z.object({
  projectId: z.string().uuid("A valid project must be selected."),
  interviewId: z.string().uuid().optional().nullable(),
  title: z
    .string()
    .min(1, "Finding title is required.")
    .max(200, "Title must be 200 characters or fewer."),
  description: z.string().min(1, "Description is required.").max(10000, "Description must be 10,000 characters or fewer."),
  category: z.enum(FindingCategory),
  severity: z.enum(SeverityLevel),
});

export const updateFindingSchema = createFindingSchema.extend({
  id: z.string().uuid("Invalid finding ID."),
});
