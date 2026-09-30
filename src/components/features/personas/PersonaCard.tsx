import Link from "next/link";
import type { Persona } from "@/types";
import { Users, User, ArrowRight } from "lucide-react";

type PersonaWithCounts = Persona & {
  _count?: {
    interviews: number;
  };
};

type Props = {
  persona: PersonaWithCounts;
};

export function PersonaCard({ persona }: Props) {
  const interviewCount = persona._count?.interviews ?? 0;
  const ageRange = persona.ageRange ?? "N/A";

  return (
    <article
      className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-ink/20"
      aria-label={`Persona: ${persona.name}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {persona.avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={persona.avatarUrl}
              alt={persona.name}
              className="size-full rounded-full object-cover"
            />
          ) : (
            <User className="size-6" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-medium text-card-foreground group-hover:text-primary transition-colors">
            {persona.name}
          </h3>
          <p className="truncate text-xs text-muted-foreground font-medium">
            {persona.role}
          </p>
          <span className="mt-1 inline-block rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
            Age: {ageRange}
          </span>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mb-4 space-y-2 text-xs">
        <div className="line-clamp-2">
          <span className="font-medium text-card-foreground">Goals:</span>{" "}
          <span className="text-muted-foreground">{persona.goals}</span>
        </div>
        <div className="line-clamp-2">
          <span className="font-medium text-card-foreground">Frustrations:</span>{" "}
          <span className="text-muted-foreground">{persona.frustrations}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-auto flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="size-3.5" aria-hidden />
          Derived from {interviewCount} interview{interviewCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Full-card link overlay */}
      <Link
        href={`/personas/${persona.id}`}
        className="absolute inset-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`Open persona: ${persona.name}`}
      >
        <span className="sr-only">View persona</span>
      </Link>

      {/* Hover arrow */}
      <ArrowRight
        className="absolute right-4 bottom-4 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </article>
  );
}
