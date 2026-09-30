import type { Metadata } from "next";
import Link from "next/link";
import { getJourneyMapsByProject } from "@/server/queries/journeyMap";
import { getAllProjects } from "@/server/queries/project";
import { JourneyMapCard } from "@/components/features/journey-maps/JourneyMapCard";
import { ProjectSelector } from "@/components/features/projects/ProjectSelector";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Map } from "lucide-react";

export const metadata: Metadata = {
  title: "Journey Maps",
  description: "Visualize key stages of the investing workflow and where participants hit friction.",
};

type SearchParams = Promise<{
  projectId?: string;
}>;

export default async function JourneyMapsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { projectId } = await searchParams;
  const projects = await getAllProjects();

  const selectedProject = projectId ? projects.find((p) => p.id === projectId) : null;

  const journeyMaps = selectedProject ? await getJourneyMapsByProject(selectedProject.id) : [];

  return (
    <div className="space-y-6">
      {/* Header / Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-display-md text-ink">Journey Maps</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {selectedProject
              ? `Investing workflows mapped for ${selectedProject.name}`
              : "Select a project to manage its journey maps"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ProjectSelector
            projects={projects}
            selectedProjectId={projectId}
            basePath="/journey-maps"
          />

          {selectedProject && (
            <Link
              href={`/journey-maps/new?projectId=${selectedProject.id}`}
              id="new-journey-map-button"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
            >
              <Plus className="size-4" />
              New Journey Map
            </Link>
          )}
        </div>
      </div>

      {selectedProject ? (
        journeyMaps.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Journey maps list">
            {journeyMaps.map((map) => (
              <li key={map.id}>
                <JourneyMapCard journeyMap={map} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
              <Map className="size-7 text-muted-foreground" aria-hidden />
            </div>
            <h2 className="text-base font-medium">No journey maps yet</h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground max-w-sm">
              Map out a key investing workflow to highlight where participants hit friction.
            </p>
            <Link
              href={`/journey-maps/new?projectId=${selectedProject.id}`}
              className={buttonVariants({ variant: "default" })}
            >
              <Plus className="size-4 mr-1.5" />
              New Journey Map
            </Link>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
            <Map className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="text-base font-medium">No project selected</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground max-w-xs">
            Please choose a project from the dropdown above to view and manage its journey maps.
          </p>
        </div>
      )}
    </div>
  );
}
