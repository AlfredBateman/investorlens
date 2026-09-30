import type { Metadata } from "next";
import Link from "next/link";
import { getFindingsByProject } from "@/server/queries/finding";
import { getAllProjects } from "@/server/queries/project";
import { getPersonasByProject } from "@/server/queries/persona";
import { FindingCard } from "@/components/features/findings/FindingCard";
import { ProjectSelector } from "@/components/features/projects/ProjectSelector";
import { FilterBar, type FilterControl } from "@/components/features/shared/FilterBar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Lightbulb } from "lucide-react";
import { FindingCategory, SeverityLevel } from "@prisma/client";

export const metadata: Metadata = {
  title: "Findings",
  description: "Record and categorize UX research findings by severity.",
};

type SearchParams = Promise<{
  projectId?: string;
  category?: string;
  severity?: string;
  personaId?: string;
  q?: string;
}>;

export default async function FindingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { projectId, category, severity, personaId, q } = await searchParams;
  const projects = await getAllProjects();

  const validCategories = Object.values(FindingCategory);
  const validSeverities = Object.values(SeverityLevel);

  const activeCategory = validCategories.some((c) => c === category)
    ? (category as FindingCategory)
    : undefined;
  const activeSeverity = validSeverities.some((s) => s === severity)
    ? (severity as SeverityLevel)
    : undefined;

  const selectedProject = projectId ? projects.find((p) => p.id === projectId) : null;

  const personas = selectedProject ? await getPersonasByProject(selectedProject.id) : [];
  const activePersona = personaId ? personas.find((p) => p.id === personaId) : undefined;

  const findings = selectedProject
    ? await getFindingsByProject(selectedProject.id, {
        category: activeCategory,
        severity: activeSeverity,
        personaId: activePersona?.id,
        search: q,
      })
    : [];

  const hasFilters = !!(activeCategory || activeSeverity || activePersona || q);

  const controls: FilterControl[] = [
    {
      type: "pills",
      param: "category",
      label: "Category",
      options: validCategories.map((c) => ({ value: c, label: c.toLowerCase().replace("_", " ") })),
    },
    {
      type: "pills",
      param: "severity",
      label: "Severity",
      options: validSeverities.map((s) => ({ value: s, label: s.toLowerCase() })),
    },
    {
      type: "select",
      param: "personaId",
      label: "Persona",
      placeholder: "All Personas",
      options: personas.map((p) => ({ value: p.id, label: p.name })),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header / Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-display-md text-ink">Findings</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {selectedProject
              ? `Research findings for ${selectedProject.name}`
              : "Select a project to manage research findings"}
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <ProjectSelector
              projects={projects}
              selectedProjectId={projectId}
              basePath="/findings"
              preserveParams={["category", "severity", "q"]}
            />

          {selectedProject && (
            <Link
              href={`/findings/new?projectId=${selectedProject.id}`}
              id="new-finding-button"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
            >
              <Plus className="size-4" />
              New Finding
            </Link>
          )}
        </div>
      </div>

      {selectedProject ? (
        <div className="space-y-6">
          <FilterBar searchParam="q" searchPlaceholder="Search findings..." controls={controls} />

          {/* Findings Grid */}
          {findings.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Findings list">
              {findings.map((finding) => (
                <li key={finding.id}>
                  <FindingCard finding={finding} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                <Lightbulb className="size-7 text-muted-foreground" aria-hidden />
              </div>
              <h2 className="text-base font-medium">No findings found</h2>
              <p className="mt-1 mb-4 text-sm text-muted-foreground max-w-sm">
                {hasFilters
                  ? "Try adjusting your search or filters to view findings."
                  : "Create your first research finding to start organizing observations."}
              </p>
              {!hasFilters && (
                <Link
                  href={`/findings/new?projectId=${selectedProject.id}`}
                  className={buttonVariants({ variant: "default" })}
                >
                  <Plus className="size-4 mr-1.5" />
                  New Finding
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
            <Lightbulb className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="text-base font-medium">No project selected</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground max-w-xs">
            Please choose a project from the dropdown above to view and manage its research findings.
          </p>
        </div>
      )}
    </div>
  );
}
