import { cn } from "@/lib/utils"
import { ORDINAL_RAMP } from "@/lib/tones"

/**
 * DESIGN.md badge-pill for ordinal levels (severity, priority, status): a
 * neutral cream pill with ink text, plus a dot stepped along the shared coral
 * ramp. The text carries the meaning; the dot only reinforces it, so level is
 * never conveyed by color alone. `emphasis` flips to solid primary for the one
 * level that should stand out (critical severity).
 */
function LevelBadge({
  step,
  label,
  emphasis = false,
  className,
}: {
  step: number
  label: string
  emphasis?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap",
        emphasis ? "bg-primary text-primary-foreground" : "bg-surface-card text-ink",
        className
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", emphasis && "ring-1 ring-primary-foreground/70")}
        style={{ backgroundColor: ORDINAL_RAMP[step] }}
      />
      {label}
    </span>
  )
}

export { LevelBadge }
