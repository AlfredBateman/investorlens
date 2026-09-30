import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProjectById } from "@/server/queries/project";
import { ProjectForm } from "@/components/features/projects/ProjectForm";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  return {
    title: project ? `Edit: ${project.name}` : "Edit Project",
  };
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href={`/projects/${id}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to project
      </Link>

      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-heading text-display-sm text-ink">Edit Project</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{project.name}</p>
        </div>
        <Badge variant={project.status === "ARCHIVED" ? "secondary" : "default"}>
          {project.status.toLowerCase()}
        </Badge>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <ProjectForm project={project} cancelHref={`/projects/${id}`} />
      </div>
    </div>
  );
}
