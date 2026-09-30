import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardData } from "@/server/queries/dashboard";
import { getAllProjects } from "@/server/queries/project";
import { getPersonasByProject } from "@/server/queries/persona";
import { RampBarChart } from "@/components/features/dashboard/RampBarChart";
import { FindingsBarChart } from "@/components/features/dashboard/FindingsBarChart";
import { FindingsTrendChart } from "@/components/features/dashboard/FindingsTrendChart";
import { ProjectSelector } from "@/components/features/projects/ProjectSelector";
import { FilterBar, type FilterControl } from "@/components/features/shared/FilterBar";
import { FindingCategory, SeverityLevel, RecommendationPriority } from "@prisma/client";
import {
  FolderOpen,
  FileText,
  Users,
  Lightbulb,
  Kanban,
  ArrowRight,
} from "lucide-react";

/**
 * src/app/(app)/dashboard/page.tsx — /dashboard
 *
 * RSC — fetches aggregate stats and chart data from the DB directly.
 * Chart components are isolated as Client Components so RSC renders the shell
 * instantly and hands off only serialisable data props.
 *
 * `projectId` is optional here (unlike every other list page): with none
 * selected the dashboard shows cross-project totals, matching its original
 * behavior; selecting a project scopes everything, stats and charts alike.
 * The category/severity/persona/priority filters only appear once a project
 * is selected, since persona identity in particular is project-scoped.
 */

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your UX research activity across all projects.",
};

type SearchParams = Promise<{
  projectId?: string;
  category?: string;
  severity?: string;
  personaId?: string;
  priority?: string;
}>;

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ElementType;
  href: string;
};

function StatCard({ label, value, icon: Icon, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-ink/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-card text-ink"
      >
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-3xl font-medium leading-none tracking-tight text-card-foreground">
          {value.toLocaleString()}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </div>
      <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
    </Link>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-1 text-sm font-medium text-foreground">{title}</h2>
      <p className="mb-4 text-xs text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { projectId, category, severity, personaId, priority } = await searchParams;
  const projects = await getAllProjects();
  const selectedProject = projectId ? projects.find((p) => p.id === projectId) : null;

  const validCategories = Object.values(FindingCategory);
  const validSeverities = Object.values(SeverityLevel);
  const validPriorities = Object.values(RecommendationPriority);

  const activeCategory = validCategories.some((c) => c === category) ? (category as FindingCategory) : undefined;
  const activeSeverity = validSeverities.some((s) => s === severity) ? (severity as SeverityLevel) : undefined;
  const activePriority = validPriorities.some((p) => p === priority)
    ? (priority as RecommendationPriority)
    : undefined;

  const personas = selectedProject ? await getPersonasByProject(selectedProject.id) : [];
  const activePersona = personaId ? personas.find((p) => p.id === personaId) : undefined;

  const {
    stats,
    findingsBySeverity,
    findingsByCategory,
    recommendationsByStatus,
    findingsByPlatform,
    findingsOverTime,
  } = await getDashboardData({
    projectId: selectedProject?.id,
    category: activeCategory,
    severity: activeSeverity,
    personaId: activePersona?.id,
    priority: activePriority,
  });

  const projectSuffix = selectedProject ? `?projectId=${selectedProject.id}` : "";

  const statCards: StatCardProps[] = [
    {
      label: "Total Projects",
      value: stats.totalProjects,
      icon: FolderOpen,
      href: "/projects",
    },
    {
      label: "Total Interviews",
      value: stats.totalInterviews,
      icon: FileText,
      href: `/interviews${projectSuffix}`,
    },
    {
      label: "Total Personas",
      value: stats.totalPersonas,
      icon: Users,
      href: `/personas${projectSuffix}`,
    },
    {
      label: "Total Findings",
      value: stats.totalFindings,
      icon: Lightbulb,
      href: `/findings${projectSuffix}`,
    },
    {
      label: "Total Recommendations",
      value: stats.totalRecommendations,
      icon: Kanban,
      href: `/recommendations${projectSuffix}`,
    },
  ];

  const controls: FilterControl[] = [
    {
      type: "pills",
      param: "category",
      label: "Category",
      options: validCategories.map((c) => ({ value: c, label: c.toLowerCase().replace("_", " ") })),
    },
    {
      type: "pills",
      param: "severity",
      label: "Severity",
      options: validSeverities.map((s) => ({ value: s, label: s.toLowerCase() })),
    },
    {
      type: "select",
      param: "personaId",
      label: "Persona",
      placeholder: "All Personas",
      options: personas.map((p) => ({ value: p.id, label: p.name })),
    },
    {
      type: "pills",
      param: "priority",
      label: "Rec. Priority",
      options: validPriorities.map((p) => ({ value: p, label: p.toLowerCase() })),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-display-md text-ink">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {selectedProject
              ? `Research activity for ${selectedProject.name}`
              : "A bird's-eye view of your UX research activity across all projects."}
          </p>
        </div>
        <ProjectSelector
          projects={projects}
          selectedProjectId={projectId}
          basePath="/dashboard"
          preserveParams={["category", "severity", "priority"]}
        />
      </div>

      {selectedProject && (
        <FilterBar controls={controls} />
      )}

      {/* Stat Cards Grid */}
      <section aria-label="Research statistics">
        <h2 className="mb-3 text-caption-upper uppercase text-muted-foreground">
          Overview
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {statCards.map((card) => (
            <li key={card.label}>
              <StatCard {...card} />
            </li>
          ))}
        </ul>
      </section>

      {/* Charts */}
      {stats.totalFindings > 0 || stats.totalRecommendations > 0 ? (
        <section aria-label="Research charts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard
              title="Findings by Severity"
              description="Findings at each impact level, low to critical."
            >
              <RampBarChart data={findingsBySeverity} />
            </ChartCard>

            <ChartCard
              title="Findings by Category"
              description="Which areas of the product generate the most findings."
            >
              <FindingsBarChart data={findingsByCategory} />
            </ChartCard>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard
              title="Recommendations by Status"
              description="Where action items sit in the pipeline, from proposed to completed."
            >
              <RampBarChart data={recommendationsByStatus} />
            </ChartCard>

            <ChartCard
              title="Findings by Platform"
              description="Which platform's interviews are surfacing the most issues."
            >
              <FindingsBarChart data={findingsByPlatform} />
            </ChartCard>
          </div>

          <ChartCard
            title="Findings Over Time"
            description="Findings discovered per week, by the linked interview's date."
          >
            <FindingsTrendChart data={findingsOverTime} />
          </ChartCard>
        </section>
      ) : null}

      {/* Empty-state when no data exists */}
      {stats.totalProjects === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
            <FolderOpen className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="text-base font-medium">Get started</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground max-w-sm">
            Create your first project to begin collecting UX research data and tracking insights.
          </p>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <FolderOpen className="size-4" />
            Create First Project
          </Link>
        </div>
      )}
    </div>
  );
}
