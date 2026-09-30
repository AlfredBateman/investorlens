import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { aiEnabled } from "@/lib/flags";
import { getAllProjects } from "@/server/queries/project";
import { getInterviewsByProject } from "@/server/queries/interview";
import { getFindingsByProject } from "@/server/queries/finding";
import { GEMINI_MODEL, geminiConfigured } from "@/server/ai/gemini";
import { ProjectSelector } from "@/components/features/projects/ProjectSelector";
import { TranscriptExtractor } from "@/components/features/ai/TranscriptExtractor";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Transcript Analysis",
  description: "Extract candidate pain points from an interview transcript with AI, then review them.",
};

type SearchParams = Promise<{ projectId?: string }>;

/** Route: /ai/transcripts — opt-in (AI_FEATURES=on); 404s otherwise. */
export default async function TranscriptAnalysisPage({ searchParams }: { searchParams: SearchParams }) {
  if (!aiEnabled()) notFound();

  const { projectId } = await searchParams;
  const projects = await getAllProjects();
  const selectedProject = projectId ? projects.find((p) => p.id === projectId) : null;

  const [interviews, findings] = selectedProject
    ? await Promise.all([getInterviewsByProject(selectedProject.id), getFindingsByProject(selectedProject.id)])
    : [[], []];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-caption-upper uppercase text-muted-foreground">Experimental · AI</p>
          <h1 className="font-heading text-display-md text-ink">Transcript Analysis</h1>
          <p className="mt-1 text-sm text-body">
            Paste or upload an interview transcript. Gemini suggests pain points and whether each supports an existing
            finding or needs a new one; you approve or reject every suggestion before anything is saved.
          </p>
        </div>
        <ProjectSelector projects={projects} selectedProjectId={projectId} basePath="/ai/transcripts" />
      </div>

      <p className="rounded-lg border border-hairline bg-surface-soft px-4 py-3 text-sm text-body">
        <strong className="font-medium text-ink">Privacy:</strong> transcript text is sent to Google&apos;s Gemini API
        ({GEMINI_MODEL}). Remove names and personal details you aren&apos;t authorised to share.
      </p>

      {!geminiConfigured() ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-body">
          <p className="font-medium text-ink">Gemini isn&apos;t configured.</p>
          <p className="mt-1">
            Add <code className="rounded bg-surface-card px-1 py-0.5">GEMINI_API_KEY=your-key</code> to <code className="rounded bg-surface-card px-1 py-0.5">.env</code>{" "}
            and restart the server. The rest of InvestorLens works without it.
          </p>
        </div>
      ) : selectedProject ? (
        <TranscriptExtractor
          key={selectedProject.id}
          projectId={selectedProject.id}
          interviews={interviews.map((i) => ({ id: i.id, candidateName: i.candidateName }))}
          findings={findings.map((f) => ({ id: f.id, title: f.title }))}
        />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
            <Sparkles className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="text-base font-medium">No project selected</h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Choose the project whose findings the transcript should be matched against.
          </p>
        </div>
      )}
    </div>
  );
}
