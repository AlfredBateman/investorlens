import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPersonaById } from "@/server/queries/persona";
import { DeletePersonaButton } from "@/components/features/personas/DeletePersonaButton";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, cn } from "@/lib/utils";
import {
  ChevronLeft,
  Pencil,
  FileText,
  User,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const persona = await getPersonaById(id);
  return {
    title: persona?.name ?? "Persona Details",
    description: persona?.role ?? "UX research persona details.",
  };
}

export default async function PersonaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const persona = await getPersonaById(id);

  if (!persona) notFound();

  const ageRange = persona.ageRange ?? "N/A";
  const occupation = persona.occupation ?? "N/A";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/personas?projectId=${persona.projectId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to Personas
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-border">
            {persona.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={persona.avatarUrl}
                alt={persona.name}
                className="size-full rounded-full object-cover"
              />
            ) : (
              <User className="size-8" />
            )}
          </div>
          <div>
            <h1 className="font-heading text-display-md text-ink">{persona.name}</h1>
            <p className="text-sm text-muted-foreground font-medium">{persona.role}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Created {formatDate(persona.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/personas/${id}/edit`}
            id="edit-persona-button"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <Pencil className="size-3.5" />
            Edit
          </Link>
          <DeletePersonaButton
            personaId={persona.id}
            personaName={persona.name}
            projectId={persona.projectId}
          />
        </div>
      </div>

      <Separator />

      {/* Main Grid Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column (Goals, Frustrations, Attributes) */}
        <div className="md:col-span-2 space-y-6">
          {/* Goals */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="text-caption-upper uppercase text-muted-foreground">
              Goals & Motivations
            </h2>
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {persona.goals}
            </div>
          </section>

          {/* Frustrations */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="text-caption-upper uppercase text-muted-foreground">
              Frustrations & Pain Points
            </h2>
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {persona.frustrations}
            </div>
          </section>
        </div>

        {/* Right Column (Demographics & Contributed Interviews) */}
        <div className="space-y-6">
          {/* Demographics Block */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-caption-upper uppercase text-muted-foreground border-b border-border pb-2">
              Demographics
            </h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-muted-foreground">Age Range:</span>
              <span className="font-medium text-right">{ageRange}</span>

              <span className="text-muted-foreground">Occupation:</span>
              <span className="font-medium text-right truncate" title={occupation}>
                {occupation}
              </span>

              <span className="text-muted-foreground">Project:</span>
              <span className="font-medium text-right truncate text-primary hover:underline">
                <Link href={`/projects/${persona.projectId}`}>{persona.project.name}</Link>
              </span>
            </div>
          </section>

          {/* Contributing Interviews */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="text-caption-upper uppercase text-muted-foreground border-b border-border pb-2">
              Derived From Interviews
            </h2>
            {persona.interviews.length > 0 ? (
              <ul className="space-y-2.5" aria-label="Contributing interviews list">
                {persona.interviews.map(({ interview }) => (
                  <li key={interview.id}>
                    <Link
                      href={`/interviews/${interview.id}`}
                      className="group flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/20 p-2.5 hover:bg-accent transition-colors block text-left"
                    >
                      <FileText className="size-4 text-primary mt-0.5 shrink-0" />
                      <div className="min-w-0 leading-tight">
                        <span className="text-xs font-medium group-hover:underline text-primary block truncate">
                          {interview.candidateName}
                        </span>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {interview.candidateRole}
                          {interview.candidateRole && interview.candidateCompany && " at "}
                          {interview.candidateCompany}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                No contributor interviews linked.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
