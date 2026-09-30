import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getRecommendationById } from "@/server/queries/recommendation";
import { PriorityBadge } from "@/components/features/recommendations/PriorityBadge";
import { StatusBadge } from "@/components/features/recommendations/StatusBadge";
import { DeleteRecommendationButton } from "@/components/features/recommendations/DeleteRecommendationButton";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, cn } from "@/lib/utils";
import {
  ChevronLeft,
  Pencil,
  Lightbulb,
  Folder,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recommendation = await getRecommendationById(id);
  return {
    title: recommendation?.title ?? "Recommendation Details",
    description: recommendation?.description ?? "Recommendation overview.",
  };
}

export default async function RecommendationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recommendation = await getRecommendationById(id);

  if (!recommendation) notFound();

  const projectId = recommendation.finding.projectId;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/recommendations?projectId=${projectId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to Board
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge priority={recommendation.priority} />
            <StatusBadge status={recommendation.status} />
          </div>
          <h1 className="font-heading text-display-md text-ink">{recommendation.title}</h1>
          <p className="text-xs text-muted-foreground">
            Created {formatDate(recommendation.createdAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/recommendations/${id}/edit`}
            id="edit-recommendation-button"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <Pencil className="size-3.5" />
            Edit
          </Link>
          <DeleteRecommendationButton
            recommendationId={recommendation.id}
            recommendationTitle={recommendation.title}
            projectId={projectId}
          />
        </div>
      </div>

      <Separator />

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column (details) */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="text-caption-upper uppercase text-muted-foreground">
              Action Plan / Description
            </h2>
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {recommendation.description}
            </div>
          </section>
        </div>

        {/* Right Column (links context) */}
        <div className="space-y-6">
          {/* Related Context */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-caption-upper uppercase text-muted-foreground border-b border-border pb-2">
              Context Details
            </h2>

            {/* Project */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Folder className="size-3.5" />
                Project
              </span>
              <div className="pl-5">
                <Link
                  href={`/projects/${projectId}`}
                  className="text-sm font-medium hover:underline text-primary"
                >
                  {recommendation.finding.project.name}
                </Link>
              </div>
            </div>

            {/* Parent Finding */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Lightbulb className="size-3.5" />
                Linked Research Finding
              </span>
              <div className="pl-5">
                <Link
                  href={`/findings/${recommendation.findingId}`}
                  className="group space-y-0.5 text-left block"
                >
                  <span className="text-sm font-medium group-hover:underline text-primary block truncate">
                    {recommendation.finding.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    Severity: {recommendation.finding.severity.toLowerCase()}
                  </span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
