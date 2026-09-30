import Link from "next/link";
import { PriorityBadge } from "./PriorityBadge";
import type { Recommendation } from "@/types";
import { ArrowRight, Lightbulb } from "lucide-react";

type RecommendationWithFinding = Recommendation & {
  finding?: {
    id: string;
    title: string;
  };
};

type Props = {
  recommendation: RecommendationWithFinding;
};

export function RecommendationCard({ recommendation }: Props) {
  return (
    <article
      className="group relative flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-ink/20"
      aria-label={`Recommendation: ${recommendation.title}`}
    >
      {/* Header info */}
      <div className="mb-3">
        <div className="mb-2">
          <PriorityBadge priority={recommendation.priority} />
        </div>
        <h4 className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
          {recommendation.title}
        </h4>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {recommendation.description}
        </p>
      </div>

      {/* Linked Finding */}
      {recommendation.finding && (
        <div className="mt-auto border-t border-border pt-2.5 text-[11px] text-muted-foreground flex items-center gap-1 min-w-0">
          <Lightbulb className="size-3 shrink-0 text-primary/70" />
          <span className="truncate">
            Finding: <span className="font-medium text-foreground">{recommendation.finding.title}</span>
          </span>
        </div>
      )}

      {/* Full-card link overlay */}
      <Link
        href={`/recommendations/${recommendation.id}`}
        className="absolute inset-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`Open recommendation: ${recommendation.title}`}
      >
        <span className="sr-only">View recommendation</span>
      </Link>

      {/* Hover arrow */}
      <ArrowRight
        className="absolute right-3 bottom-3.5 size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </article>
  );
}
