/**
 * src/lib/validations/recommendation.ts
 *
 * Zod validation schemas for Recommendation forms.
 */

import { z } from "zod";
import { RecommendationPriority, RecommendationStatus } from "@prisma/client";

export const createRecommendationSchema = z.object({
  findingId: z.string().uuid("A valid finding must be selected."),
  title: z
    .string()
    .min(1, "Recommendation title is required.")
    .max(200, "Title must be 200 characters or fewer."),
  description: z.string().min(1, "Description is required.").max(10000, "Description must be 10,000 characters or fewer."),
  status: z.enum(RecommendationStatus).default("PROPOSED"),
  priority: z.enum(RecommendationPriority).default("MEDIUM"),
});

export const updateRecommendationSchema = createRecommendationSchema.extend({
  id: z.string().uuid("Invalid recommendation ID."),
});
