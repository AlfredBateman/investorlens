import type { RecommendationPriority } from "@prisma/client";
import { LevelBadge } from "@/components/ui/level-badge";
import { PRIORITY_LABELS, PRIORITY_STEP } from "@/lib/tones";

type Props = {
  priority: string;
  className?: string;
};

export function PriorityBadge({ priority, className }: Props) {
  const level = priority as RecommendationPriority;
  if (!(level in PRIORITY_STEP)) return null;
  return (
    <LevelBadge
      step={PRIORITY_STEP[level]}
      label={`${PRIORITY_LABELS[level]} priority`}
      className={className}
    />
  );
}
