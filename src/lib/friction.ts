import type { PainPointType } from "@prisma/client";

/** Journey stage friction scale: 0 = none … 5 = severe. */
export const FRICTION_MAX = 5;

/** Stages rated at or above this are highlighted as high friction. */
export const HIGH_FRICTION = 4;

export const FRICTION_LABELS = ["None", "Minimal", "Low", "Moderate", "High", "Severe"] as const;

export type FrictionLevel = "none" | "low" | "moderate" | "high";

export function frictionLevel(rating: number): FrictionLevel {
  if (rating >= HIGH_FRICTION) return "high";
  if (rating === 3) return "moderate";
  return rating > 0 ? "low" : "none";
}

/** Fill color per level, from DESIGN.md tokens (coral is reserved for the highlight). */
export const FRICTION_FILL: Record<FrictionLevel, string> = {
  none: "bg-hairline",
  low: "bg-accent-teal",
  moderate: "bg-accent-amber",
  high: "bg-primary",
};

export const PAIN_LABELS: Record<PainPointType, string> = {
  CONFUSION: "Confusion",
  FRICTION: "Friction",
  DELAY: "Delay",
  UNCERTAINTY: "Uncertainty",
  OTHER: "Other",
};
