import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getInterviewById } from "@/server/queries/interview";
import { InterviewForm } from "@/components/features/interviews/InterviewForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const interview = await getInterviewById(id);
  return {
    title: interview ? `Edit: ${interview.candidateName}` : "Edit Interview",
  };
}

export default async function EditInterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const interview = await getInterviewById(id);

  if (!interview) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/interviews/${id}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to interview
      </Link>

      <div>
        <h1 className="font-heading text-display-sm text-ink">Edit Interview</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Update the record for <span className="font-medium text-foreground">{interview.candidateName}</span>.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <InterviewForm
          interview={interview}
          projectId={interview.projectId}
          cancelHref={`/interviews/${id}`}
        />
      </div>
    </div>
  );
}
