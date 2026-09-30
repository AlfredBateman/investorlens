import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getProjectById } from "@/server/queries/project";
import { getFindingsByProject } from "@/server/queries/finding";
import { RecommendationForm } from "@/components/features/recommendations/RecommendationForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "New Recommendation",
  description: "Create a new product recommendation.",
};

type SearchParams = Promise<{
  projectId?: string;
  findingId?: string;
}>;

export default async function NewRecommendationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { projectId, findingId } = await searchParams;

  if (!projectId) {
    redirect("/recommendations");
  }

  const project = await getProjectById(projectId);
  if (!project) {
    notFound();
  }

  const findings = await getFindingsByProject(projectId);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href={`/recommendations?projectId=${projectId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to board
      </Link>

      <div>
        <h1 className="font-heading text-display-sm text-ink">New Recommendation</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Define an action item for <span className="font-medium text-foreground">{project.name}</span>.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <RecommendationForm
          findings={findings}
          cancelHref={`/recommendations?projectId=${projectId}`}
          defaultFindingId={findingId}
        />
      </div>
    </div>
  );
}
