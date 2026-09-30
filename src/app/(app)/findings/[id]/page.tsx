import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getFindingById } from "@/server/queries/finding";
import type { Recommendation } from "@/types";
import { SeverityBadge } from "@/components/features/findings/SeverityBadge";
import { StatusBadge } from "@/components/features/recommendations/StatusBadge";
import { CategoryBadge } from "@/components/features/findings/CategoryBadge";
import { DeleteFindingButton } from "@/components/features/findings/DeleteFindingButton";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, cn } from "@/lib/utils";
import {
  ChevronLeft,
  Pencil,
  FileText,
  Folder,
  Lightbulb,
  ExternalLink,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const finding = await getFindingById(id);
  return {
    title: finding?.title ?? "Finding Details",
    description: finding?.description ?? "UX research finding details.",
  };
}

export default async function FindingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const finding = await getFindingById(id);

  if (!finding) notFound();

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/findings?projectId=${finding.projectId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to Findings
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge severity={finding.severity} />
            <CategoryBadge category={finding.category} />
          </div>
          <h1 className="font-heading text-display-md text-ink">{finding.title}</h1>
          <p className="text-xs text-muted-foreground">
            Recorded {formatDate(finding.createdAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/findings/${id}/edit`}
            id="edit-finding-button"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <Pencil className="size-3.5" />
            Edit
          </Link>
          <DeleteFindingButton
            findingId={finding.id}
            findingTitle={finding.title}
            projectId={finding.projectId}
          />
        </div>
      </div>

      <Separator />

      {/* Main content grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column (description & recommendations) */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="text-caption-upper uppercase text-muted-foreground">
              Description / Observation
            </h2>
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {finding.description}
            </div>
          </section>

          {/* Driven Recommendations */}
          <section className="space-y-4">
            <h2 className="text-caption-upper uppercase text-muted-foreground">
              Recommendations
            </h2>
            {finding.recommendations.length > 0 ? (
              <ul className="space-y-3" aria-label="Linked recommendations">
                {finding.recommendations.map((rec: Recommendation) => (
                  <li
                    key={rec.id}
                    className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-medium text-sm">{rec.title}</h3>
                      <StatusBadge status={rec.status} />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {rec.description}
                    </p>
                    <Link
                      href={`/recommendations?findingId=${finding.id}`}
                      className="text-xs text-primary hover:underline mt-2 self-start flex items-center gap-1"
                    >
                      View in board <ExternalLink className="size-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center bg-card/50">
                <Lightbulb className="size-6 text-muted-foreground mb-2" aria-hidden />
                <p className="text-xs text-muted-foreground">No recommendations yet.</p>
                <Link
                  href={`/recommendations/new?findingId=${finding.id}`}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Create first recommendation
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Right column (relationships & details metadata) */}
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-caption-upper uppercase text-muted-foreground border-b border-border pb-2">
              Context Details
            </h2>

            {/* Parent Project */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Folder className="size-3.5" />
                Project
              </span>
              <div className="pl-5">
                <Link
                  href={`/projects/${finding.projectId}`}
                  className="text-sm font-medium hover:underline text-primary"
                >
                  {finding.project.name}
                </Link>
              </div>
            </div>

            {/* Source Interview */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <FileText className="size-3.5" />
                Source Interview
              </span>
              <div className="pl-5">
                {finding.interview ? (
                  <Link
                    href={`/interviews/${finding.interviewId}`}
                    className="group space-y-0.5 text-left block"
                  >
                    <span className="text-sm font-medium group-hover:underline text-primary block">
                      {finding.interview.candidateName}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      {finding.interview.candidateRole}
                      {finding.interview.candidateRole && finding.interview.candidateCompany && " at "}
                      {finding.interview.candidateCompany}
                    </span>
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    Not derived from a specific interview
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
