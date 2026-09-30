import Link from "next/link";
import type { PainPointType } from "@prisma/client";
import {
  FRICTION_FILL,
  FRICTION_LABELS,
  FRICTION_MAX,
  PAIN_LABELS,
  frictionLevel,
  type FrictionLevel,
} from "@/lib/friction";
import { cn } from "@/lib/utils";

type Stage = {
  id: string;
  name: string;
  description: string | null;
  painType: PainPointType | null;
  frictionRating: number;
  findings: { id: string; title: string }[];
  personas: { id: string; name: string }[];
};

const NODE_STYLE: Record<FrictionLevel, string> = {
  none: "border-hairline text-muted-foreground",
  low: "border-accent-teal text-ink",
  moderate: "border-accent-amber text-ink",
  high: "border-primary-active bg-primary-active text-primary-foreground",
};

/** Horizontal stepper for a journey map; high-friction stages get a coral node, border and badge. */
export function JourneyStepper({ stages }: { stages: Stage[] }) {
  return (
    <div
      role="region"
      aria-label="Journey stages, scroll horizontally"
      tabIndex={0}
      className="-mx-1 overflow-x-auto px-1 pb-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-xl"
    >
      <ol className="flex min-w-max snap-x">
        {stages.map((stage, index) => {
          const level = frictionLevel(stage.frictionRating);
          const high = level === "high";
          const isLast = index === stages.length - 1;

          return (
            <li key={stage.id} className="flex w-64 shrink-0 snap-start flex-col">
              {/* Rail: numbered node + connector to the next stage */}
              <div className="flex items-center" aria-hidden>
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full border-2 bg-background text-sm font-medium",
                    NODE_STYLE[level]
                  )}
                >
                  {index + 1}
                </span>
                {!isLast && <span className="h-px flex-1 bg-hairline" />}
              </div>

              <article
                className={cn(
                  "mt-4 mr-4 flex flex-1 flex-col gap-3 rounded-xl p-5",
                  high ? "bg-background ring-1 ring-primary" : "bg-surface-card"
                )}
                aria-label={`Stage ${index + 1}: ${stage.name}`}
              >
                {high && (
                  <span className="self-start rounded-full bg-primary-active px-2.5 py-0.5 text-caption-upper uppercase text-primary-foreground">
                    High friction
                  </span>
                )}

                <h3 className="text-base font-medium leading-snug text-ink">{stage.name}</h3>

                {/* Friction meter: visual bars are decorative, the text carries the value */}
                <div className="space-y-1.5">
                  <div className="flex gap-1" aria-hidden>
                    {Array.from({ length: FRICTION_MAX }, (_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1.5 flex-1 rounded-full",
                          i < stage.frictionRating ? FRICTION_FILL[level] : "bg-hairline"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-body">
                    Friction {stage.frictionRating}/{FRICTION_MAX} · {FRICTION_LABELS[stage.frictionRating]}
                    {stage.painType && ` · ${PAIN_LABELS[stage.painType]}`}
                  </p>
                </div>

                {stage.description && (
                  <p className="text-sm leading-relaxed text-body">{stage.description}</p>
                )}

                {stage.findings.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-caption-upper uppercase text-body">Findings</h4>
                    <ul className="space-y-1">
                      {stage.findings.map((f) => (
                        <li key={f.id}>
                          <Link
                            href={`/findings/${f.id}`}
                            className="text-sm leading-snug text-ink underline decoration-primary underline-offset-3 hover:decoration-2"
                          >
                            {f.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {stage.personas.length > 0 && (
                  <div className="mt-auto space-y-1.5 pt-1">
                    <h4 className="text-caption-upper uppercase text-body">Personas</h4>
                    <ul className="flex flex-wrap gap-1.5">
                      {stage.personas.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/personas/${p.id}`}
                            className={cn(
                              "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-ink",
                              high ? "bg-surface-card" : "bg-background"
                            )}
                          >
                            {p.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
