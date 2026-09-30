import type { SeverityLevel } from "@prisma/client";
import { LevelBadge } from "@/components/ui/level-badge";
import { SEVERITY_LABELS, SEVERITY_STEP } from "@/lib/tones";

type Props = {
  severity: string;
  className?: string;
};

export function SeverityBadge({ severity, className }: Props) {
  const level = severity as SeverityLevel;
  if (!(level in SEVERITY_STEP)) return null;
  return (
    <LevelBadge
      step={SEVERITY_STEP[level]}
      label={SEVERITY_LABELS[level]}
      emphasis={level === "CRITICAL"}
      className={className}
    />
  );
}
