import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getFindingById } from "@/server/queries/finding";
import { getInterviewsByProject } from "@/server/queries/interview";
import { FindingForm } from "@/components/features/findings/FindingForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const finding = await getFindingById(id);
  return {
    title: finding ? `Edit: ${finding.title}` : "Edit Finding",
  };
}

export default async function EditFindingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const finding = await getFindingById(id);

  if (!finding) notFound();

  const interviews = await getInterviewsByProject(finding.projectId);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href={`/findings/${id}`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ChevronLeft className="size-4" />
        Back to finding
      </Link>

      <div>
        <h1 className="font-heading text-display-sm text-ink">Edit Finding</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Update finding details for <span className="font-medium text-foreground">{finding.project.name}</span>.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <FindingForm
          finding={finding}
          projectId={finding.projectId}
          interviews={interviews}
          cancelHref={`/findings/${id}`}
        />
      </div>
    </div>
  );
}
