import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getProjectById } from "@/server/queries/project";
import { getPersonasByProject } from "@/server/queries/persona";
import { getFindingsByProject } from "@/server/queries/finding";
import { JourneyMapForm } from "@/components/features/journey-maps/JourneyMapForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "New Journey Map",
  description: "Map a key stage of the investing workflow.",
};

type SearchParams = Promise<{
  projectId?: string;
}>;

export default async function NewJourneyMapPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { projectId } = await searchParams;

  if (!projectId) {
    redirect("/journey-maps");
  }

  const project = await getProjectById(projectId);
  if (!project) {
    notFound();
  }

  const [personas, findings] = await Promise.all([
    getPersonasByProject(projectId),
    getFindingsByProject(projectId),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/journey-maps?projectId=${projectId}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to journey maps
      </Link>

      <div>
        <h1 className="font-heading text-display-sm text-ink">New Journey Map</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Map a workflow for <span className="font-medium text-foreground">{project.name}</span>.
        </p>
      </div>

      <div className="rounded-xl border border-hairline bg-card p-6">
        <JourneyMapForm
          projectId={projectId}
          personas={personas}
          findings={findings}
          cancelHref={`/journey-maps?projectId=${projectId}`}
        />
      </div>
    </div>
  );
}
