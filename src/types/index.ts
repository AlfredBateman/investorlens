/**
 * src/types/index.ts
 *
 * Application-wide TypeScript type definitions.
 *
 * Re-exports Prisma-generated model and enum types for use in components and
 * server functions, keeping import paths short (e.g. `import type { Project }
 * from "@/types"`). Enum types come from prisma/schema.prisma, the single
 * source of truth for allowed values.
 */

export type {
  Project,
  Interview,
  Persona,
  Finding,
  Recommendation,
  FindingCategory,
  SeverityLevel,
  RecommendationStatus,
  RecommendationPriority,
} from "@prisma/client";

import type { Project, Prisma } from "@prisma/client";

/** A project enriched with its relational record counts for dashboard cards. */
export type ProjectWithCounts = Project & {
  _count: Prisma.ProjectCountOutputType;
};
