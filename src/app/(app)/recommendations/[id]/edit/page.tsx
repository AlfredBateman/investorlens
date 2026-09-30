import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getRecommendationById } from "@/server/queries/recommendation";
import { getFindingsByProject } from "@/server/queries/finding";
import { RecommendationForm } from "@/components/features/recommendations/RecommendationForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recommendation = await getRecommendationById(id);
  return {
    title: recommendation ? `Edit: ${recommendation.title}` : "Edit Recommendation",
  };
}

export default async function EditRecommendationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recommendation = await getRecommendationById(id);

  if (!recommendation) notFound();

  const projectId = recommendation.finding.projectId;
  const findings = await getFindingsByProject(projectId);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href={`/recommendations/${id}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to recommendation
      </Link>

      <div>
        <h1 className="font-heading text-display-sm text-ink">Edit Recommendation</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Update action plan for <span className="font-medium text-foreground">{recommendation.finding.project.name}</span>.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <RecommendationForm
          recommendation={recommendation}
          findings={findings}
          cancelHref={`/recommendations/${id}`}
        />
      </div>
    </div>
  );
}
