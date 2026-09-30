import type { RecommendationStatus } from "@prisma/client";
import { LevelBadge } from "@/components/ui/level-badge";
import { STATUS_LABELS, STATUS_STEP } from "@/lib/tones";

type Props = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className }: Props) {
  const level = status as RecommendationStatus;
  if (!(level in STATUS_STEP)) return null;
  return <LevelBadge step={STATUS_STEP[level]} label={STATUS_LABELS[level]} className={className} />;
}
