import Link from "next/link";
import { SeverityBadge } from "./SeverityBadge";
import { CategoryBadge } from "./CategoryBadge";
import { formatDate } from "@/lib/utils";
import type { Finding } from "@/types";
import { ArrowRight, Lightbulb } from "lucide-react";

type FindingWithCounts = Finding & {
  _count?: {
    recommendations: number;
  };
};

type Props = {
  finding: FindingWithCounts;
};

export function FindingCard({ finding }: Props) {
  const recommendationsCount = finding._count?.recommendations ?? 0;

  return (
    <article
      className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-ink/20"
      aria-label={`Finding: ${finding.title}`}
    >
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <SeverityBadge severity={finding.severity} />
          <CategoryBadge category={finding.category} />
        </div>
        <h3 className="text-base font-medium text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
          {finding.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {finding.description}
        </p>
      </div>

      {/* Stats/Footer row */}
      <div className="mt-auto flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Lightbulb className="size-3.5" aria-hidden />
          {recommendationsCount} recommendation{recommendationsCount !== 1 ? "s" : ""}
        </span>
        <span className="ml-auto text-[11px]">
          {formatDate(finding.createdAt)}
        </span>
      </div>

      {/* Full-card link overlay */}
      <Link
        href={`/findings/${finding.id}`}
        className="absolute inset-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`Open finding: ${finding.title}`}
      >
        <span className="sr-only">View finding</span>
      </Link>

      {/* Hover arrow indicator */}
      <ArrowRight
        className="absolute right-4 bottom-4 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </article>
  );
}
