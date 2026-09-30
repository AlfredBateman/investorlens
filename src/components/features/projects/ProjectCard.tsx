/**
 * src/components/features/projects/ProjectCard.tsx
 *
 * Server Component — renders a single project as a rich card on the
 * /projects list page.
 *
 * Receives a ProjectWithCounts (Project + _count) as a prop so it can
 * display interview, finding, and persona counts without any additional
 * database queries inside this component.
 */

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { ProjectWithCounts } from "@/types";
import { FileText, Users, Lightbulb, ArrowRight } from "lucide-react";

type Props = {
  project: ProjectWithCounts;
};

export function ProjectCard({ project }: Props) {
  const isArchived = project.status === "ARCHIVED";

  return (
    <article
      className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-ink/20"
      aria-label={`Project: ${project.name}`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-medium text-card-foreground">
            {project.name}
          </h2>
          {project.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
        <Badge
          variant={isArchived ? "secondary" : "default"}
          className="shrink-0 capitalize"
        >
          {project.status.toLowerCase()}
        </Badge>
      </div>

      {/* Stats row */}
      <div className="mt-auto flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <FileText className="size-3.5" aria-hidden />
          {project._count.interviews} interview{project._count.interviews !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Lightbulb className="size-3.5" aria-hidden />
          {project._count.findings} finding{project._count.findings !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Users className="size-3.5" aria-hidden />
          {project._count.personas} persona{project._count.personas !== 1 ? "s" : ""}
        </span>
        <span className="ml-auto text-[11px]">
          {formatDate(project.createdAt)}
        </span>
      </div>

      {/* Full-card link overlay — accessible by covering the whole card */}
      <Link
        href={`/projects/${project.id}`}
        className="absolute inset-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`Open project: ${project.name}`}
      >
        <span className="sr-only">View project</span>
      </Link>

      {/* Hover arrow indicator */}
      <ArrowRight
        className="absolute right-4 bottom-4 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </article>
  );
}
