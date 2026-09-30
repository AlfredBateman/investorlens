import type { Metadata } from "next";
import Link from "next/link";
import { getPersonasByProject } from "@/server/queries/persona";
import { getAllProjects } from "@/server/queries/project";
import { PersonaCard } from "@/components/features/personas/PersonaCard";
import { ProjectSelector } from "@/components/features/projects/ProjectSelector";
import { FilterBar } from "@/components/features/shared/FilterBar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Personas",
  description: "View and manage UX research personas derived from interviews.",
};

type SearchParams = Promise<{
  projectId?: string;
  q?: string;
}>;

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { projectId, q } = await searchParams;
  const projects = await getAllProjects();

  const selectedProject = projectId ? projects.find((p) => p.id === projectId) : null;

  const personas = selectedProject ? await getPersonasByProject(selectedProject.id, q) : [];

  return (
    <div className="space-y-6">
      {/* Header / Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-display-md text-ink">Personas</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {selectedProject
              ? `User personas synthesized for ${selectedProject.name}`
              : "Select a project to manage user personas"}
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <ProjectSelector
              projects={projects}
              selectedProjectId={projectId}
              basePath="/personas"
              preserveParams={["q"]}
            />

          {selectedProject && (
            <Link
              href={`/personas/new?projectId=${selectedProject.id}`}
              id="new-persona-button"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
            >
              <Plus className="size-4" />
              New Persona
            </Link>
          )}
        </div>
      </div>

      {selectedProject ? (
        <div className="space-y-6">
          <FilterBar searchParam="q" searchPlaceholder="Search personas..." />

          {/* Personas Grid */}
          {personas.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Personas list">
              {personas.map((persona) => (
                <li key={persona.id}>
                  <PersonaCard persona={persona} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                <Users className="size-7 text-muted-foreground" aria-hidden />
              </div>
              <h2 className="text-base font-medium">No personas found</h2>
              <p className="mt-1 mb-4 text-sm text-muted-foreground max-w-sm">
                {q
                  ? "Try adjusting your search to view personas."
                  : "Synthesize observations from your interviews into target user personas."}
              </p>
              {!q && (
                <Link
                  href={`/personas/new?projectId=${selectedProject.id}`}
                  className={buttonVariants({ variant: "default" })}
                >
                  <Plus className="size-4 mr-1.5" />
                  New Persona
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
            <Users className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="text-base font-medium">No project selected</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground max-w-xs">
            Please choose a project from the dropdown above to view and manage its user personas.
          </p>
        </div>
      )}
    </div>
  );
}
