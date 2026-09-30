import type { Metadata } from "next";
import Link from "next/link";
import { getRecommendationsByProject } from "@/server/queries/recommendation";
import { getAllProjects } from "@/server/queries/project";
import { RecommendationCard } from "@/components/features/recommendations/RecommendationCard";
import { ProjectSelector } from "@/components/features/projects/ProjectSelector";
import { FilterBar, type FilterControl } from "@/components/features/shared/FilterBar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ORDINAL_RAMP, STATUS_LABELS, STATUS_STEP } from "@/lib/tones";
import { Plus, Kanban } from "lucide-react";
import { RecommendationPriority, RecommendationStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Recommendations",
  description: "Track product recommendations derived from research findings.",
};

type SearchParams = Promise<{
  projectId?: string;
  priority?: string;
  status?: string;
  q?: string;
}>;

const STATUSES = Object.values(RecommendationStatus);
const PRIORITIES = Object.values(RecommendationPriority);

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { projectId, priority, status, q } = await searchParams;
  const projects = await getAllProjects();

  const selectedProject = projectId ? projects.find((p) => p.id === projectId) : null;

  const activePriority = PRIORITIES.some((p) => p === priority)
    ? (priority as RecommendationPriority)
    : undefined;
  const activeStatus = STATUSES.some((s) => s === status) ? (status as RecommendationStatus) : undefined;

  const recommendations = selectedProject
    ? await getRecommendationsByProject(selectedProject.id, {
        priority: activePriority,
        status: activeStatus,
        search: q,
      })
    : [];

  // Group recommendations by status
  const columns: Record<RecommendationStatus, typeof recommendations> = {
    PROPOSED: [],
    APPROVED: [],
    IN_PROGRESS: [],
    COMPLETED: [],
  };

  recommendations.forEach((rec) => {
    columns[rec.status as RecommendationStatus].push(rec);
  });

  const controls: FilterControl[] = [
    {
      type: "pills",
      param: "priority",
      label: "Priority",
      options: PRIORITIES.map((p) => ({ value: p, label: p.toLowerCase() })),
    },
    {
      type: "pills",
      param: "status",
      label: "Status",
      options: STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-display-md text-ink">Recommendations</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {selectedProject
              ? `Action items derived from findings for ${selectedProject.name}`
              : "Select a project to manage implementation recommendations"}
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <ProjectSelector
              projects={projects}
              selectedProjectId={projectId}
              basePath="/recommendations"
              preserveParams={["priority", "status", "q"]}
            />

          {selectedProject && (
            <Link
              href={`/recommendations/new?projectId=${selectedProject.id}`}
              id="new-recommendation-button"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
            >
              <Plus className="size-4" />
              New Recommendation
            </Link>
          )}
        </div>
      </div>

      {selectedProject ? (
        <div className="space-y-6">
          <FilterBar searchParam="q" searchPlaceholder="Search recommendations..." controls={controls} />

          {/* Kanban columns: top rule steps along the same ramp as the status badges */}
          <div className="grid gap-4 md:grid-cols-4 items-start" aria-label="Kanban Board">
            {STATUSES.map((s) => {
              const list = columns[s];
              return (
                <section
                  key={s}
                  className="flex min-h-[300px] flex-col rounded-xl border border-border border-t-4 bg-surface-soft p-4"
                  style={{ borderTopColor: ORDINAL_RAMP[STATUS_STEP[s]] }}
                  aria-label={STATUS_LABELS[s]}
                >
                  {/* Column Title */}
                  <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-2">
                    <h3 className="text-sm font-medium text-foreground">
                      {STATUS_LABELS[s]}
                    </h3>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground font-mono">
                      {list.length}
                    </span>
                  </div>

                  {/* Recommendation cards */}
                  {list.length > 0 ? (
                    <ul className="space-y-3" aria-label={`Recommendations in ${STATUS_LABELS[s]}`}>
                      {list.map((rec) => (
                        <li key={rec.id}>
                          <RecommendationCard recommendation={rec} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-[11px] text-muted-foreground italic">No action items</p>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
            <Kanban className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="text-base font-medium">No project selected</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground max-w-xs">
            Please choose a project from the dropdown above to view and manage its recommendations Kanban board.
          </p>
        </div>
      )}
    </div>
  );
}
