/**
 * src/server/queries/dashboard.ts
 *
 * Read-only database queries for the Dashboard overview.
 * Runs all counts and group-bys in a single Promise.all for maximum parallelism.
 *
 * Scoping: `projectId` is optional — omitted, every number is a cross-project
 * total (the dashboard's original behavior); supplied, everything scopes to
 * that project, same as every other list page.
 *
 * Ordering: Prisma's `groupBy` orderBy on a string-backed enum sorts
 * alphabetically, which scrambles a pipeline (APPROVED, COMPLETED,
 * IN_PROGRESS, PROPOSED). Every breakdown here is instead re-ordered against
 * `Object.values(Enum)`, which reflects the enum's declared order, and
 * zero-fills categories with no rows so a filtered chart doesn't just drop bars.
 */

import { db } from "@/lib/db";
import {
  FindingCategory,
  SeverityLevel,
  RecommendationStatus,
  RecommendationPriority,
  InvestingPlatform,
} from "@prisma/client";
import { PLATFORM_LABELS } from "@/lib/platform-labels";
import { SEVERITY_LABELS, STATUS_LABELS } from "@/lib/tones";

export type DashboardFilters = {
  projectId?: string;
  /** Findings-derived charts (severity, category, trend, platform) share these. */
  category?: FindingCategory;
  severity?: SeverityLevel;
  personaId?: string;
  /** Recommendations-by-status chart. */
  priority?: RecommendationPriority;
};

export type DashboardStats = {
  totalProjects: number;
  totalInterviews: number;
  totalPersonas: number;
  totalFindings: number;
  totalRecommendations: number;
};

export type CountByLabel = { label: string; count: number };

export type DashboardData = {
  stats: DashboardStats;
  findingsBySeverity: CountByLabel[];
  findingsByCategory: CountByLabel[];
  recommendationsByStatus: CountByLabel[];
  findingsByPlatform: CountByLabel[];
  /** Weekly finding counts, bucketed by the linked interview's date, zero-filled across the range. */
  findingsOverTime: { week: string; count: number }[];
};

const CATEGORY_LABEL: Record<FindingCategory, string> = {
  KYC: "KYC",
  ONBOARDING: "Onboarding",
  RESEARCH: "Research",
  PORTFOLIO: "Portfolio",
  SUPPORT: "Support",
  OTHER: "Other",
};

/** Re-orders a groupBy result against an enum's declared order and zero-fills gaps. */
function orderByEnum<E extends string>(
  groups: { count: number; key: E }[],
  order: readonly E[],
  labels: Record<E, string>
): CountByLabel[] {
  const counts = new Map(groups.map((g) => [g.key, g.count]));
  return order.map((key) => ({ label: labels[key], count: counts.get(key) ?? 0 }));
}

/** Monday-start UTC week the date falls in, as an ISO date string (used as both bucket key and sort key). */
function weekStart(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return d.toISOString().slice(0, 10);
}

function formatWeek(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(isoDate));
}

export async function getDashboardData(filters: DashboardFilters = {}): Promise<DashboardData> {
  const { projectId, category, severity, personaId, priority } = filters;

  const findingWhere = {
    ...(projectId && { projectId }),
    ...(category && { category }),
    ...(severity && { severity }),
    ...(personaId && { interview: { personas: { some: { personaId } } } }),
  };

  const recommendationWhere = {
    ...(projectId && { projectId }),
    ...(priority && { priority }),
  };

  const [
    totalProjects,
    totalInterviews,
    totalPersonas,
    totalFindings,
    totalRecommendations,
    severityGroups,
    categoryGroups,
    statusGroups,
    findingInterviews,
  ] = await Promise.all([
    projectId ? db.project.count({ where: { id: projectId } }) : db.project.count(),
    db.interview.count({ where: projectId ? { projectId } : undefined }),
    db.persona.count({ where: projectId ? { projectId } : undefined }),
    db.finding.count({ where: findingWhere }),
    db.recommendation.count({ where: recommendationWhere }),
    db.finding.groupBy({ by: ["severity"], where: findingWhere, _count: { _all: true } }),
    db.finding.groupBy({ by: ["category"], where: findingWhere, _count: { _all: true } }),
    db.recommendation.groupBy({ by: ["status"], where: recommendationWhere, _count: { _all: true } }),
    // Platform + trend both key off the finding's *interview*, so pull that relation once.
    db.finding.findMany({
      where: { ...findingWhere, interviewId: { not: null } },
      select: { interview: { select: { platform: true, dateConducted: true } } },
    }),
  ]);

  const platformCounts = new Map<InvestingPlatform, number>();
  const weekCounts = new Map<string, number>();
  for (const { interview } of findingInterviews) {
    if (!interview) continue;
    platformCounts.set(interview.platform, (platformCounts.get(interview.platform) ?? 0) + 1);
    const week = weekStart(interview.dateConducted);
    weekCounts.set(week, (weekCounts.get(week) ?? 0) + 1);
  }

  // Zero-fill every week in range so a quiet week reads as "0 findings," not a gap.
  const weekKeys = [...weekCounts.keys()].sort();
  const findingsOverTime: { week: string; count: number }[] = [];
  if (weekKeys.length > 0) {
    const cursor = new Date(weekKeys[0]);
    const last = new Date(weekKeys[weekKeys.length - 1]);
    while (cursor <= last) {
      const key = cursor.toISOString().slice(0, 10);
      findingsOverTime.push({ week: formatWeek(key), count: weekCounts.get(key) ?? 0 });
      cursor.setUTCDate(cursor.getUTCDate() + 7);
    }
  }

  return {
    stats: { totalProjects, totalInterviews, totalPersonas, totalFindings, totalRecommendations },
    findingsBySeverity: orderByEnum(
      severityGroups.map((g) => ({ key: g.severity, count: g._count._all })),
      Object.values(SeverityLevel),
      SEVERITY_LABELS
    ),
    // Category is nominal, so rank it like platform: the tallest bar answers "which area".
    findingsByCategory: orderByEnum(
      categoryGroups.map((g) => ({ key: g.category, count: g._count._all })),
      Object.values(FindingCategory),
      CATEGORY_LABEL
    ).sort((a, b) => b.count - a.count),
    recommendationsByStatus: orderByEnum(
      statusGroups.map((g) => ({ key: g.status, count: g._count._all })),
      Object.values(RecommendationStatus),
      STATUS_LABELS
    ),
    // Ranked by count, descending — the chart's job is "which platform generates the most findings."
    findingsByPlatform: Object.values(InvestingPlatform)
      .map((platform) => ({ label: PLATFORM_LABELS[platform], count: platformCounts.get(platform) ?? 0 }))
      .sort((a, b) => b.count - a.count),
    findingsOverTime,
  };
}
