import type { Metadata } from "next";
import Link from "next/link";
import { searchProject, type SearchResults } from "@/server/queries/search";
import { getAllProjects } from "@/server/queries/project";
import { ProjectSelector } from "@/components/features/projects/ProjectSelector";
import { FilterBar } from "@/components/features/shared/FilterBar";
import { SeverityBadge } from "@/components/features/findings/SeverityBadge";
import { StatusBadge } from "@/components/features/recommendations/StatusBadge";
import { CategoryBadge } from "@/components/features/findings/CategoryBadge";
import { PriorityBadge } from "@/components/features/recommendations/PriorityBadge";
import { formatDate, truncate } from "@/lib/utils";
import { Search, FileText, Lightbulb, Users, Kanban } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across interviews, findings, personas and recommendations.",
};

type SearchParams = Promise<{
  projectId?: string;
  q?: string;
}>;

function ResultSection({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string;
  icon: LucideIcon;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section aria-label={title}>
      <h2 className="mb-3 flex items-center gap-2 text-caption-upper uppercase text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        {title}
        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono normal-case">{count}</span>
      </h2>
      <ul className="space-y-2">{children}</ul>
    </section>
  );
}

function ResultRow({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="block rounded-lg border border-border bg-card p-4 text-sm transition-colors hover:border-ink/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      >
        {children}
      </Link>
    </li>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { projectId, q } = await searchParams;
  const projects = await getAllProjects();
  const selectedProject = projectId ? projects.find((p) => p.id === projectId) : null;
  const query = q?.trim() ?? "";

  const results: SearchResults | null =
    selectedProject && query ? await searchProject(selectedProject.id, query) : null;

  const totalResults = results
    ? results.interviews.length +
      results.findings.length +
      results.personas.length +
      results.recommendations.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-display-md text-ink">Search</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {selectedProject
              ? `Searching interviews, findings, personas and recommendations in ${selectedProject.name}`
              : "Select a project to search its research data"}
          </p>
        </div>

        <ProjectSelector
          projects={projects}
          selectedProjectId={projectId}
          basePath="/search"
          preserveParams={["q"]}
        />
      </div>

      {selectedProject && <FilterBar searchParam="q" searchPlaceholder="Search everything..." />}

      {!selectedProject ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
            <Search className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="text-base font-medium">No project selected</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground max-w-xs">
            Choose a project above, then search across its interviews, findings, personas and recommendations.
          </p>
        </div>
      ) : !query ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
            <Search className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="text-base font-medium">Type to search</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground max-w-sm">
            Search interviews, findings, personas and recommendations in {selectedProject.name}.
          </p>
        </div>
      ) : totalResults === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
            <Search className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="text-base font-medium">No results</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground max-w-sm">
            Nothing matched &ldquo;{query}&rdquo; in {selectedProject.name}.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <ResultSection title="Interviews" icon={FileText} count={results!.interviews.length}>
            {results!.interviews.map((interview) => (
              <ResultRow key={interview.id} href={`/interviews/${interview.id}`}>
                <p className="font-medium text-foreground">{interview.candidateName}</p>
                <p className="text-xs text-muted-foreground">
                  {interview.candidateRole}
                  {interview.candidateRole && interview.candidateCompany && " at "}
                  {interview.candidateCompany}
                  {" · "}
                  {formatDate(interview.dateConducted)}
                </p>
              </ResultRow>
            ))}
          </ResultSection>

          <ResultSection title="Findings" icon={Lightbulb} count={results!.findings.length}>
            {results!.findings.map((finding) => (
              <ResultRow key={finding.id} href={`/findings/${finding.id}`}>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <SeverityBadge severity={finding.severity} />
                  <CategoryBadge category={finding.category} />
                </div>
                <p className="font-medium text-foreground">{finding.title}</p>
                <p className="text-xs text-muted-foreground">{truncate(finding.description, 140)}</p>
              </ResultRow>
            ))}
          </ResultSection>

          <ResultSection title="Personas" icon={Users} count={results!.personas.length}>
            {results!.personas.map((persona) => (
              <ResultRow key={persona.id} href={`/personas/${persona.id}`}>
                <p className="font-medium text-foreground">{persona.name}</p>
                <p className="text-xs text-muted-foreground">{persona.role}</p>
              </ResultRow>
            ))}
          </ResultSection>

          <ResultSection title="Recommendations" icon={Kanban} count={results!.recommendations.length}>
            {results!.recommendations.map((rec) => (
              <ResultRow key={rec.id} href={`/recommendations/${rec.id}`}>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <PriorityBadge priority={rec.priority} />
                  <StatusBadge status={rec.status} />
                </div>
                <p className="font-medium text-foreground">{rec.title}</p>
                <p className="text-xs text-muted-foreground">{truncate(rec.description, 140)}</p>
              </ResultRow>
            ))}
          </ResultSection>
        </div>
      )}
    </div>
  );
}
