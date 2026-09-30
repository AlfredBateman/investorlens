import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPersonaById } from "@/server/queries/persona";
import { getInterviewsByProject } from "@/server/queries/interview";
import { PersonaForm } from "@/components/features/personas/PersonaForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const persona = await getPersonaById(id);
  return {
    title: persona ? `Edit: ${persona.name}` : "Edit Persona",
  };
}

export default async function EditPersonaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const persona = await getPersonaById(id);

  if (!persona) notFound();

  const interviews = await getInterviewsByProject(persona.projectId);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href={`/personas/${id}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to persona
      </Link>

      <div>
        <h1 className="font-heading text-display-sm text-ink">Edit Persona</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Update persona attributes for <span className="font-medium text-foreground">{persona.project.name}</span>.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <PersonaForm
          persona={persona}
          projectId={persona.projectId}
          interviews={interviews}
          cancelHref={`/personas/${id}`}
        />
      </div>
    </div>
  );
}
