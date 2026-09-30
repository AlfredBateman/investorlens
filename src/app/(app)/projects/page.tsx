import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects } from "@/server/queries/project";
import { ProjectCard } from "@/components/features/projects/ProjectCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FolderPlus, FolderOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse and manage all your UX research projects.",
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-display-md text-ink">Projects</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/projects/new"
          id="new-project-button"
          className={cn(buttonVariants({ variant: "default" }), "gap-1.5")}
        >
          <FolderPlus className="size-4" />
          New Project
        </Link>
      </div>

      {projects.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Project list">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
            <FolderOpen className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="text-base font-medium">No projects yet</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Create your first project to start organizing research.
          </p>
          <Link href="/projects/new" className={buttonVariants({ variant: "default" })}>
            <FolderPlus className="size-4 mr-1.5" />
            New Project
          </Link>
        </div>
      )}
    </div>
  );
}
