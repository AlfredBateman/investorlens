import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getProjectById } from "@/server/queries/project";
import { getInterviewsByProject } from "@/server/queries/interview";
import { FindingForm } from "@/components/features/findings/FindingForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "New Finding",
  description: "Create a new UX research finding.",
};

type SearchParams = Promise<{
  projectId?: string;
}>;

export default async function NewFindingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { projectId } = await searchParams;

  if (!projectId) {
    redirect("/findings");
  }

  const project = await getProjectById(projectId);
  if (!project) {
    notFound();
  }

  const interviews = await getInterviewsByProject(projectId);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href={`/findings?projectId=${projectId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to findings
      </Link>

      <div>
        <h1 className="font-heading text-display-sm text-ink">New Finding</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Record a new observation for <span className="font-medium text-foreground">{project.name}</span>.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <FindingForm
          projectId={projectId}
          interviews={interviews}
          cancelHref={`/findings?projectId=${projectId}`}
        />
      </div>
    </div>
  );
}
