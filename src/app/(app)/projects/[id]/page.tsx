import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProjectById } from "@/server/queries/project";
import { ProjectStatCard } from "@/components/features/projects/ProjectStatCard";
import { DeleteProjectButton } from "@/components/features/projects/DeleteProjectButton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, cn } from "@/lib/utils";
import {
  FileText,
  Lightbulb,
  Users,
  Pencil,
  ChevronLeft,
  MessageSquare,
  FileDown,
  Kanban,
  Map,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  return {
    title: project?.name ?? "Project",
    description: project?.description ?? "UX research project overview.",
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) notFound();

  const isArchived = project.status === "ARCHIVED";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/projects"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        All Projects
      </Link>

      {/* Project header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-heading text-display-md text-ink">{project.name}</h1>
            <Badge variant={isArchived ? "secondary" : "default"} className="capitalize">
              {project.status.toLowerCase()}
            </Badge>
          </div>
          {project.description && (
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Created {formatDate(project.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/report/${id}`}
            id="export-report-button"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <FileDown className="size-3.5" aria-hidden />
            Export report
          </Link>
          <Link
            href={`/projects/${id}/edit`}
            id="edit-project-button"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <Pencil className="size-3.5" />
            Edit
          </Link>
          <DeleteProjectButton projectId={id} projectName={project.name} />
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <section aria-label="Project statistics">
        <h2 className="mb-3 text-caption-upper uppercase text-muted-foreground">
          Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <ProjectStatCard label="Interviews" value={project._count.interviews} icon={MessageSquare} />
          <ProjectStatCard label="Findings" value={project._count.findings} icon={Lightbulb} />
          <ProjectStatCard label="Personas" value={project._count.personas} icon={Users} />
          <ProjectStatCard label="Recommendations" value={project._count.recommendations} icon={Kanban} />
          <ProjectStatCard label="Journey Maps" value={project._count.journeyMaps} icon={Map} />
        </div>
      </section>

      <Separator />

      {/* Quick links */}
      <section aria-label="Project sections">
        <h2 className="mb-3 text-caption-upper uppercase text-muted-foreground">
          Research Data
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Interviews", description: "View and add interview notes", href: `/interviews?projectId=${id}`, icon: FileText },
            { label: "Personas", description: "Manage synthesized user personas", href: `/personas?projectId=${id}`, icon: Users },
            { label: "Findings", description: "Record and categorize findings", href: `/findings?projectId=${id}`, icon: Lightbulb },
            { label: "Recommendations", description: "Track product recommendations", href: `/recommendations?projectId=${id}`, icon: Kanban },
            { label: "Journey Maps", description: "Visualize investing workflows", href: `/journey-maps?projectId=${id}`, icon: Map },
          ].map(({ label, description, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm transition-colors hover:border-ink/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
              id={`project-section-${label.toLowerCase()}`}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="font-medium">{label}</p>
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
