import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getInterviewById } from "@/server/queries/interview";
import { DeleteInterviewButton } from "@/components/features/interviews/DeleteInterviewButton";
import { SeverityBadge } from "@/components/features/findings/SeverityBadge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PLATFORM_LABELS } from "@/lib/platform-labels";
import { formatDate, cn } from "@/lib/utils";
import { ChevronLeft, Pencil, Folder, Lightbulb } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const interview = await getInterviewById(id);
  return {
    title: interview?.candidateName ?? "Interview Details",
    description: "UX research interview details.",
  };
}

/** Route: /interviews/[id] — single interview detail with full notes. */
export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const interview = await getInterviewById(id);

  if (!interview) notFound();

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/interviews?projectId=${interview.projectId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to Interviews
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{PLATFORM_LABELS[interview.platform]}</Badge>
            <Badge variant="outline">Age {interview.age}</Badge>
          </div>
          <h1 className="font-heading text-display-md text-ink">{interview.candidateName}</h1>
          <p className="text-sm text-muted-foreground">
            {interview.candidateRole}
            {interview.candidateRole && interview.candidateCompany && " at "}
            {interview.candidateCompany}
          </p>
          <p className="text-xs text-muted-foreground">
            Interviewed {formatDate(interview.dateConducted)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/interviews/${id}/edit`}
            id="edit-interview-button"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <Pencil className="size-3.5" />
            Edit
          </Link>
          <DeleteInterviewButton
            interviewId={interview.id}
            candidateName={interview.candidateName}
            projectId={interview.projectId}
          />
        </div>
      </div>

      <Separator />

      {/* Main content grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column */}
        <div className="md:col-span-2 space-y-6">
          {(interview.investingBehavior || interview.goals || interview.frustrations) && (
            <section className="grid gap-4 sm:grid-cols-2">
              {interview.investingBehavior && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-2 sm:col-span-2">
                  <h2 className="text-caption-upper uppercase text-muted-foreground">
                    Investing Behavior
                  </h2>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {interview.investingBehavior}
                  </p>
                </div>
              )}
              {interview.goals && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                  <h2 className="text-caption-upper uppercase text-muted-foreground">
                    Goals
                  </h2>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {interview.goals}
                  </p>
                </div>
              )}
              {interview.frustrations && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                  <h2 className="text-caption-upper uppercase text-muted-foreground">
                    Frustrations
                  </h2>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {interview.frustrations}
                  </p>
                </div>
              )}
            </section>
          )}

          <section className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="text-caption-upper uppercase text-muted-foreground">
              Session Notes
            </h2>
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {interview.notesText}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-caption-upper uppercase text-muted-foreground border-b border-border pb-2">
              Context Details
            </h2>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Folder className="size-3.5" />
                Project
              </span>
              <div className="pl-5">
                <Link
                  href={`/projects/${interview.projectId}`}
                  className="text-sm font-medium hover:underline text-primary"
                >
                  {interview.project.name}
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="text-caption-upper uppercase text-muted-foreground border-b border-border pb-2">
              Findings From This Interview
            </h2>
            {interview.findings.length > 0 ? (
              <ul className="space-y-2.5" aria-label="Findings derived from this interview">
                {interview.findings.map((finding) => (
                  <li key={finding.id}>
                    <Link
                      href={`/findings/${finding.id}`}
                      className="group flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/20 p-2.5 hover:bg-accent transition-colors block text-left"
                    >
                      <Lightbulb className="size-4 text-primary mt-0.5 shrink-0" />
                      <div className="min-w-0 leading-tight space-y-1">
                        <span className="text-xs font-medium group-hover:underline text-primary block truncate">
                          {finding.title}
                        </span>
                        <SeverityBadge severity={finding.severity} className="text-[10px]" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                No findings recorded from this interview yet.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
