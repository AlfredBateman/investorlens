import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getProjectById } from "@/server/queries/project";
import { getInterviewsByProject } from "@/server/queries/interview";
import { PersonaForm } from "@/components/features/personas/PersonaForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "New Persona",
  description: "Create a new user persona.",
};

type SearchParams = Promise<{
  projectId?: string;
}>;

export default async function NewPersonaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { projectId } = await searchParams;

  if (!projectId) {
    redirect("/personas");
  }

  const project = await getProjectById(projectId);
  if (!project) {
    notFound();
  }

  const interviews = await getInterviewsByProject(projectId);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href={`/personas?projectId=${projectId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to personas
      </Link>

      <div>
        <h1 className="font-heading text-display-sm text-ink">New Persona</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Define a new user persona for <span className="font-medium text-foreground">{project.name}</span>.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <PersonaForm
          projectId={projectId}
          interviews={interviews}
          cancelHref={`/personas?projectId=${projectId}`}
        />
      </div>
    </div>
  );
}
