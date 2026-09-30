import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getJourneyMapById } from "@/server/queries/journeyMap";
import { getPersonasByProject } from "@/server/queries/persona";
import { getFindingsByProject } from "@/server/queries/finding";
import { JourneyMapForm } from "@/components/features/journey-maps/JourneyMapForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const journeyMap = await getJourneyMapById(id);
  return {
    title: journeyMap ? `Edit: ${journeyMap.title}` : "Edit Journey Map",
  };
}

export default async function EditJourneyMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const journeyMap = await getJourneyMapById(id);

  if (!journeyMap) notFound();

  const [personas, findings] = await Promise.all([
    getPersonasByProject(journeyMap.projectId),
    getFindingsByProject(journeyMap.projectId),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/journey-maps/${id}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to journey map
      </Link>

      <div>
        <h1 className="font-heading text-display-sm text-ink">Edit Journey Map</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Update the workflow for <span className="font-medium text-foreground">{journeyMap.project.name}</span>.
        </p>
      </div>

      <div className="rounded-xl border border-hairline bg-card p-6">
        <JourneyMapForm
          journeyMap={journeyMap}
          projectId={journeyMap.projectId}
          personas={personas}
          findings={findings}
          cancelHref={`/journey-maps/${id}`}
        />
      </div>
    </div>
  );
}
