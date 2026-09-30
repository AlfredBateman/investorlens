/**
 * src/lib/validations/interview.ts
 *
 * Zod validation schemas for Interview forms.
 */

import { z } from "zod";
import { InvestingPlatform } from "@prisma/client";

export const createInterviewSchema = z.object({
  projectId: z.string().uuid("A valid project must be selected."),
  candidateName: z
    .string()
    .min(1, "Participant name is required.")
    .max(150, "Name must be 150 characters or fewer."),
  candidateRole: z
    .string()
    .max(100, "Occupation must be 100 characters or fewer.")
    .nullish(),
  candidateCompany: z
    .string()
    .max(150, "Company must be 150 characters or fewer.")
    .nullish(),
  age: z.coerce.number().int().min(18, "Participants must be 18 or older.").max(100),
  platform: z.enum(InvestingPlatform),
  investingBehavior: z.string().max(2000).nullish(),
  goals: z.string().max(2000).nullish(),
  frustrations: z.string().max(2000).nullish(),
  dateConducted: z.coerce.date({ message: "Interview date is required." }),
  notesText: z.string().min(1, "Interview notes cannot be empty."),
});

export const updateInterviewSchema = createInterviewSchema.extend({
  id: z.string().uuid("Invalid interview ID."),
});
