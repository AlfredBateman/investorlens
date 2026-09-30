import Link from "next/link";
import { FRICTION_FILL, HIGH_FRICTION, frictionLevel } from "@/lib/friction";
import { cn, formatDate } from "@/lib/utils";

type JourneyMapListItem = {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  stages: { id: string; name: string; frictionRating: number }[];
};

type Props = {
  journeyMap: JourneyMapListItem;
};

export function JourneyMapCard({ journeyMap }: Props) {
  const highCount = journeyMap.stages.filter((s) => s.frictionRating >= HIGH_FRICTION).length;

  return (
    <article
      className="relative flex h-full flex-col gap-4 rounded-xl bg-surface-card p-6"
      aria-label={`Journey map: ${journeyMap.title}`}
    >
      <div className="space-y-1.5">
        <h3 className="text-lg font-medium leading-snug text-ink">{journeyMap.title}</h3>
        {journeyMap.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-body">{journeyMap.description}</p>
        )}
      </div>

      {/* Mini friction strip: one bar per stage, in journey order */}
      <div className="mt-auto space-y-2">
        <div className="flex items-end gap-1" aria-hidden>
          {journeyMap.stages.map((s) => (
            <span
              key={s.id}
              title={`${s.name}: ${s.frictionRating}/5`}
              className={cn("flex-1 rounded-sm", FRICTION_FILL[frictionLevel(s.frictionRating)])}
              style={{ height: `${6 + s.frictionRating * 4}px` }}
            />
          ))}
        </div>
        <p className="flex items-center justify-between text-xs text-body">
          <span>
            {journeyMap.stages.length} stage{journeyMap.stages.length !== 1 ? "s" : ""}
            {highCount > 0 && (
              <>
                {" · "}
                <span className="inline-flex items-center gap-1 font-medium text-ink"><span className="size-1.5 rounded-full bg-primary" aria-hidden />{highCount} high friction</span>
              </>
            )}
          </span>
          <span>{formatDate(journeyMap.createdAt)}</span>
        </p>
      </div>

      <Link
        href={`/journey-maps/${journeyMap.id}`}
        className="absolute inset-0 rounded-xl focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`Open journey map: ${journeyMap.title}`}
      />
    </article>
  );
}
