import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getProjectById } from "@/server/queries/project";
import { InterviewForm } from "@/components/features/interviews/InterviewForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "New Interview",
  description: "Record a new participant interview.",
};

type SearchParams = Promise<{
  projectId?: string;
}>;

export default async function NewInterviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { projectId } = await searchParams;

  if (!projectId) {
    redirect("/interviews");
  }

  const project = await getProjectById(projectId);
  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/interviews?projectId=${projectId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to interviews
      </Link>

      <div>
        <h1 className="font-heading text-display-sm text-ink">New Interview</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Record a participant interview for <span className="font-medium text-foreground">{project.name}</span>.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <InterviewForm projectId={projectId} cancelHref={`/interviews?projectId=${projectId}`} />
      </div>
    </div>
  );
}
