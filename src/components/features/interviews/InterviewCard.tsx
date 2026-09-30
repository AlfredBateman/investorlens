import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_LABELS } from "@/lib/platform-labels";
import { formatDate } from "@/lib/utils";
import type { Interview } from "@/types";
import { ArrowRight, User, Calendar } from "lucide-react";

type InterviewListItem = Pick<
  Interview,
  "id" | "candidateName" | "candidateRole" | "candidateCompany" | "age" | "platform" | "dateConducted"
>;

type Props = {
  interview: InterviewListItem;
};

export function InterviewCard({ interview }: Props) {
  return (
    <article
      className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-ink/20"
      aria-label={`Interview: ${interview.candidateName}`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium text-card-foreground group-hover:text-primary transition-colors">
              {interview.candidateName}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {interview.candidateRole}
              {interview.candidateRole && interview.candidateCompany && " at "}
              {interview.candidateCompany}
              {!interview.candidateRole && !interview.candidateCompany && `Age ${interview.age}`}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {PLATFORM_LABELS[interview.platform]}
        </Badge>
      </div>

      {/* Stats/Footer row */}
      <div className="mt-auto flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>Age {interview.age}</span>
        <span className="ml-auto flex items-center gap-1 text-[11px]">
          <Calendar className="size-3" aria-hidden />
          {formatDate(interview.dateConducted)}
        </span>
      </div>

      {/* Full-card link overlay */}
      <Link
        href={`/interviews/${interview.id}`}
        className="absolute inset-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`Open interview: ${interview.candidateName}`}
      >
        <span className="sr-only">View interview</span>
      </Link>

      {/* Hover arrow indicator */}
      <ArrowRight
        className="absolute right-4 bottom-4 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </article>
  );
}
