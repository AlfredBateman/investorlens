import type { Metadata } from "next";
import Link from "next/link";
import { getInterviewsByProject } from "@/server/queries/interview";
import { getAllProjects } from "@/server/queries/project";
import { InterviewCard } from "@/components/features/interviews/InterviewCard";
import { ProjectSelector } from "@/components/features/projects/ProjectSelector";
import { FilterBar, type FilterControl } from "@/components/features/shared/FilterBar";
import { PLATFORM_LABELS } from "@/lib/platform-labels";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, FileText } from "lucide-react";
import { InvestingPlatform } from "@prisma/client";

export const metadata: Metadata = {
  title: "Interviews",
  description: "Browse and manage your UX research interviews.",
};

type SearchParams = Promise<{
  projectId?: string;
  platform?: string;
  ageMin?: string;
  ageMax?: string;
  q?: string;
}>;

const PLATFORMS = Object.values(InvestingPlatform);

/** Route: /interviews — interview list, scoped to a selected project. */
export default async function InterviewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { projectId, platform, ageMin, ageMax, q } = await searchParams;
  const projects = await getAllProjects();

  const activePlatform = PLATFORMS.some((p) => p === platform)
    ? (platform as InvestingPlatform)
    : undefined;
  const parsedAgeMin = ageMin ? Number(ageMin) : undefined;
  const parsedAgeMax = ageMax ? Number(ageMax) : undefined;

  const selectedProject = projectId ? projects.find((p) => p.id === projectId) : null;

  const interviews = selectedProject
    ? await getInterviewsByProject(selectedProject.id, {
        platform: activePlatform,
        ageMin: Number.isFinite(parsedAgeMin) ? parsedAgeMin : undefined,
        ageMax: Number.isFinite(parsedAgeMax) ? parsedAgeMax : undefined,
        search: q,
      })
    : [];

  const hasFilters = !!(activePlatform || parsedAgeMin || parsedAgeMax || q);

  const controls: FilterControl[] = [
    {
      type: "pills",
      param: "platform",
      label: "Platform",
      options: PLATFORMS.map((p) => ({ value: p, label: PLATFORM_LABELS[p] })),
    },
    { type: "range", paramMin: "ageMin", paramMax: "ageMax", label: "Age", min: 18, max: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Header / Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-display-md text-ink">Interviews</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {selectedProject
              ? `Interview records for ${selectedProject.name}`
              : "Select a project to manage its interviews"}
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <ProjectSelector
            projects={projects}
            selectedProjectId={projectId}
            basePath="/interviews"
            preserveParams={["platform", "ageMin", "ageMax", "q"]}
          />

          {selectedProject && (
            <Link
              href={`/interviews/new?projectId=${selectedProject.id}`}
              id="new-interview-button"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
            >
              <Plus className="size-4" />
              New Interview
            </Link>
          )}
        </div>
      </div>

      {selectedProject ? (
        <div className="space-y-6">
          <FilterBar searchParam="q" searchPlaceholder="Search interviews..." controls={controls} />

          {interviews.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Interviews list">
              {interviews.map((interview) => (
                <li key={interview.id}>
                  <InterviewCard interview={interview} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                <FileText className="size-7 text-muted-foreground" aria-hidden />
              </div>
              <h2 className="text-base font-medium">
                {hasFilters ? "No interviews found" : "No interviews yet"}
              </h2>
              <p className="mt-1 mb-4 text-sm text-muted-foreground max-w-sm">
                {hasFilters
                  ? "Try adjusting your search or filters to view interviews."
                  : "Record your first participant interview to start building research findings."}
              </p>
              {!hasFilters && (
                <Link
                  href={`/interviews/new?projectId=${selectedProject.id}`}
                  className={buttonVariants({ variant: "default" })}
                >
                  <Plus className="size-4 mr-1.5" />
                  New Interview
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
            <FileText className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="text-base font-medium">No project selected</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground max-w-xs">
            Please choose a project from the dropdown above to view and manage its interviews.
          </p>
        </div>
      )}
    </div>
  );
}
