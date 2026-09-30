import type { RecommendationPriority, RecommendationStatus, SeverityLevel } from "@prisma/client";

/**
 * One ordinal ramp for every "more of it" scale in the app: severity,
 * priority and recommendation status. Single coral hue, light -> dark, built
 * from DESIGN.md's coral and validated with the dataviz skill's --ordinal
 * check against the canvas (#faf9f5): monotone lightness, >= 0.06 step gaps,
 * light end >= 2:1. Hex rather than CSS vars because Recharts takes hex.
 */
export const ORDINAL_RAMP = ["#db9e8a", "#c56545", "#844029", "#3e1e13"] as const;

/** Ramp step (0-3) for each level. Priority's 3 levels skip the palest step. */
export const SEVERITY_STEP: Record<SeverityLevel, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
export const PRIORITY_STEP: Record<RecommendationPriority, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
export const STATUS_STEP: Record<RecommendationStatus, number> = {
  PROPOSED: 0,
  APPROVED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
};

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};
export const PRIORITY_LABELS: Record<RecommendationPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};
export const STATUS_LABELS: Record<RecommendationStatus, string> = {
  PROPOSED: "Proposed",
  APPROVED: "Approved",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};
