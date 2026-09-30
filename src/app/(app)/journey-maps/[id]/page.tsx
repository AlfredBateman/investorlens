import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getJourneyMapById } from "@/server/queries/journeyMap";
import { DeleteJourneyMapButton } from "@/components/features/journey-maps/DeleteJourneyMapButton";
import { JourneyStepper } from "@/components/features/journey-maps/JourneyStepper";
import { buttonVariants } from "@/components/ui/button";
import { FRICTION_FILL, HIGH_FRICTION, type FrictionLevel } from "@/lib/friction";
import { formatDate, cn } from "@/lib/utils";
import { ChevronLeft, Pencil } from "lucide-react";

const LEGEND: { level: FrictionLevel; label: string }[] = [
  { level: "none", label: "None" },
  { level: "low", label: "Low (1–2)" },
  { level: "moderate", label: "Moderate (3)" },
  { level: "high", label: `High (${HIGH_FRICTION}–5)` },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const journeyMap = await getJourneyMapById(id);
  return {
    title: journeyMap?.title ?? "Journey Map",
    description: journeyMap?.description ?? "Investing journey map.",
  };
}

export default async function JourneyMapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const journeyMap = await getJourneyMapById(id);

  if (!journeyMap) notFound();

  const highStages = journeyMap.stages.filter((s) => s.frictionRating >= HIGH_FRICTION);

  return (
    <div className="space-y-8">
      <Link
        href={`/journey-maps?projectId=${journeyMap.projectId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to Journey Maps
      </Link>

      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-caption-upper uppercase text-muted-foreground">
            <Link href={`/projects/${journeyMap.projectId}`} className="hover:text-ink">
              {journeyMap.project.name}
            </Link>
          </p>
          <h1 className="font-heading text-display-md text-ink">{journeyMap.title}</h1>
          {journeyMap.description && (
            <p className="text-base leading-relaxed text-body">{journeyMap.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {journeyMap.stages.length} stages · Created {formatDate(journeyMap.createdAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/journey-maps/${id}/edit`}
            id="edit-journey-map-button"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <Pencil className="size-3.5" />
            Edit
          </Link>
          <DeleteJourneyMapButton
            journeyMapId={journeyMap.id}
            journeyMapTitle={journeyMap.title}
            projectId={journeyMap.projectId}
          />
        </div>
      </header>

      {/* Summary + legend */}
      <div className="flex flex-col gap-3 border-y border-hairline py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-body">
          {highStages.length > 0 ? (
            <>
              <span className="font-medium text-ink">
                {highStages.length} of {journeyMap.stages.length} stages
              </span>{" "}
              are high friction: {highStages.map((s) => s.name).join(", ")}.
            </>
          ) : (
            "No stage is rated high friction."
          )}
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Friction legend">
          {LEGEND.map(({ level, label }) => (
            <li key={level} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn("size-2.5 rounded-full", FRICTION_FILL[level])} aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <JourneyStepper stages={journeyMap.stages} />
    </div>
  );
}
