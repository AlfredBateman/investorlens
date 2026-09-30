/**
 * src/app/report/[projectId]/page.tsx — /report/[projectId]
 *
 * Printable research report for one project, in README's "Report Export"
 * order. Deliberately outside the (app) route group so it renders without the
 * app shell; "Print / Save as PDF" hands it to the browser's print dialog,
 * which is the PDF renderer (no PDF dependency). The column is capped near
 * A4's printable width so charts lay out identically on screen and on paper.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecommendationStatus } from "@prisma/client";
import { getProjectById } from "@/server/queries/project";
import { getInterviewsByProject } from "@/server/queries/interview";
import { getFindingsByProject } from "@/server/queries/finding";
import { getPersonasByProject } from "@/server/queries/persona";
import { getRecommendationsByProject } from "@/server/queries/recommendation";
import { getJourneyMapsByProject } from "@/server/queries/journeyMap";
import { getDashboardData, type CountByLabel } from "@/server/queries/dashboard";
import { SeverityBadge } from "@/components/features/findings/SeverityBadge";
import { CategoryBadge } from "@/components/features/findings/CategoryBadge";
import { PriorityBadge } from "@/components/features/recommendations/PriorityBadge";
import { RampBarChart } from "@/components/features/dashboard/RampBarChart";
import { FindingsBarChart } from "@/components/features/dashboard/FindingsBarChart";
import { FindingsTrendChart } from "@/components/features/dashboard/FindingsTrendChart";
import { PrintButton } from "@/components/features/report/PrintButton";
import { buttonVariants } from "@/components/ui/button";
import { PLATFORM_LABELS } from "@/lib/platform-labels";
import { FRICTION_LABELS, FRICTION_MAX, HIGH_FRICTION, PAIN_LABELS } from "@/lib/friction";
import { STATUS_LABELS } from "@/lib/tones";
import { cn, formatDate } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

type Params = Promise<{ projectId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { projectId } = await params;
  const project = await getProjectById(projectId);
  return { title: project ? `${project.name} — Research Report` : "Research Report" };
}

/** "a", "a and b", "a, b and c". */
function joinList(items: string[]) {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** Labels tied for the highest non-zero count (input already sorted descending). */
function leaders(data: CountByLabel[]) {
  const top = data[0]?.count ?? 0;
  return top > 0 ? data.filter((d) => d.count === top).map((d) => d.label) : [];
}

/** " The most affected area is X." -- or, when every non-zero bucket ties, there is no leader: say it's spread evenly. */
function leadSentence(data: CountByLabel[], lead: (x: string) => string, even: (x: string) => string) {
  const top = leaders(data);
  if (top.length === 0) return "";
  const spread = top.length > 1 && top.length === data.filter((d) => d.count > 0).length;
  return ` ${(spread ? even : lead)(joinList(top))}`;
}

/** "3 proposed, 1 completed" from a breakdown, skipping zeros. */
function breakdown(data: CountByLabel[]) {
  return joinList(data.filter((d) => d.count > 0).map((d) => `${d.count} ${d.label.toLowerCase()}`));
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 border-t border-hairline pt-8" aria-labelledby={`section-${n}`}>
      <h2 id={`section-${n}`} className="font-heading text-display-sm text-ink break-after-avoid">
        <span className="text-muted-foreground">{n}.</span> {title}
      </h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm italic text-muted-foreground">{children}</p>;
}

function Figure({ title, caption, children }: { title: string; caption: string; children: React.ReactNode }) {
  return (
    <figure className="break-inside-avoid rounded-xl border border-hairline p-5">
      <figcaption className="mb-3">
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="block text-xs text-muted-foreground">{caption}</span>
      </figcaption>
      {children}
    </figure>
  );
}

export default async function ReportPage({ params }: { params: Params }) {
  const { projectId } = await params;
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const [interviews, findings, personas, recommendations, journeyMaps, charts] = await Promise.all([
    getInterviewsByProject(projectId),
    getFindingsByProject(projectId),
    getPersonasByProject(projectId),
    getRecommendationsByProject(projectId),
    getJourneyMapsByProject(projectId),
    getDashboardData({ projectId }),
  ]);

  const interviewName = new Map(interviews.map((i) => [i.id, i.candidateName]));

  // Participant overview
  const ages = interviews.map((i) => i.age);
  const dates = interviews.map((i) => new Date(i.dateConducted).getTime());
  const platformCounts = Object.entries(
    interviews.reduce<Record<string, number>>((acc, i) => {
      const label = PLATFORM_LABELS[i.platform];
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const highFrictionStages = [
    ...new Set(journeyMaps.flatMap((m) => m.stages.filter((s) => s.frictionRating >= HIGH_FRICTION).map((s) => s.name))),
  ];

  const categorySentence = leadSentence(
    charts.findingsByCategory,
    (x) => `The most affected area is ${x}.`,
    (x) => `Findings are spread evenly across ${x}.`
  );
  const platformSentence = leadSentence(
    charts.findingsByPlatform,
    (x) => `${x} interviews produced the most findings.`,
    (x) => `Findings came evenly from ${x} interviews.`
  );
  const severityText = breakdown([...charts.findingsBySeverity].reverse());
  const statusText = breakdown(charts.recommendationsByStatus);

  const kpis = [
    { label: "Interviews", value: interviews.length },
    { label: "Personas", value: personas.length },
    { label: "Findings", value: findings.length },
    { label: "Recommendations", value: recommendations.length },
  ];

  return (
    <main className="mx-auto max-w-[680px] px-5 py-10 text-ink print:max-w-none print:p-0">
      {/* Screen-only toolbar */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/projects/${projectId}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Back to project
        </Link>
        <PrintButton />
      </div>

      {/* Title block */}
      <header className="space-y-3 pb-8">
        <p className="text-caption-upper uppercase text-muted-foreground">UX Research Report</p>
        <h1 className="font-heading text-display-md text-ink">{project.name}</h1>
        {project.description && <p className="text-base leading-relaxed text-body">{project.description}</p>}
        <p className="text-xs text-muted-foreground">Generated {formatDate(new Date())}</p>
      </header>

      <div className="space-y-10">
        <Section n={1} title="Executive summary">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Key figures">
            {kpis.map((k) => (
              <li key={k.label} className="rounded-xl bg-surface-card p-4">
                <p className="text-2xl font-medium leading-none">{k.value}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{k.label}</p>
              </li>
            ))}
          </ul>
          <div className="space-y-3 text-base leading-relaxed text-body">
            {interviews.length > 0 ? (
              <p>
                This study draws on {plural(interviews.length, "interview")} with participants aged{" "}
                {Math.min(...ages)}–{Math.max(...ages)}, conducted between {formatDate(new Date(Math.min(...dates)))} and{" "}
                {formatDate(new Date(Math.max(...dates)))}, and synthesises them into{" "}
                {plural(personas.length, "persona")}.
              </p>
            ) : (
              <p>No interviews have been recorded for this project yet.</p>
            )}
            {findings.length > 0 && (
              <p>
                Research surfaced {plural(findings.length, "finding")} ({severityText}).
                {categorySentence}
                {platformSentence}
              </p>
            )}
            {highFrictionStages.length > 0 && (
              <p>The highest-friction journey stages are {joinList(highFrictionStages)}.</p>
            )}
            {recommendations.length > 0 && (
              <p>
                {plural(recommendations.length, "recommendation")} address these findings: {statusText}.
              </p>
            )}
          </div>
        </Section>

        <Section n={2} title="Participant overview">
          {interviews.length === 0 ? (
            <Empty>No interviews recorded.</Empty>
          ) : (
            <>
              <p className="text-sm text-body">
                Platforms: {platformCounts.map(([label, n]) => `${label} ${n}`).join(" · ")}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-hairline text-caption-upper uppercase text-muted-foreground">
                      <th scope="col" className="py-2 pr-3 font-medium">Participant</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Age</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Occupation</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Platform</th>
                      <th scope="col" className="py-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviews.map((i) => (
                      <tr key={i.id} className="break-inside-avoid border-b border-hairline align-top">
                        <td className="py-2 pr-3 font-medium">{i.candidateName}</td>
                        <td className="py-2 pr-3 tabular-nums">{i.age}</td>
                        <td className="py-2 pr-3 text-body">{i.candidateRole ?? "—"}</td>
                        <td className="py-2 pr-3 text-body">{PLATFORM_LABELS[i.platform]}</td>
                        <td className="py-2 whitespace-nowrap text-body">{formatDate(i.dateConducted)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Section>

        <Section n={3} title="Findings">
          {findings.length === 0 ? (
            <Empty>No findings recorded.</Empty>
          ) : (
            <ol className="space-y-5">
              {findings.map((f) => (
                <li key={f.id} className="break-inside-avoid space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <SeverityBadge severity={f.severity} />
                    <CategoryBadge category={f.category} />
                  </div>
                  <h3 className="text-base font-medium text-ink">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-body">{f.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.interviewId ? `Source: ${interviewName.get(f.interviewId) ?? "interview"}` : "Not tied to one interview"}
                    {" · "}
                    {plural(f._count.recommendations, "recommendation")}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Section>

        <Section n={4} title="Personas">
          {personas.length === 0 ? (
            <Empty>No personas defined.</Empty>
          ) : (
            <div className="space-y-4">
              {personas.map((p) => (
                <article key={p.id} className="break-inside-avoid space-y-3 rounded-xl bg-surface-card p-5">
                  <div>
                    <h3 className="text-lg font-medium text-ink">{p.name}</h3>
                    <p className="text-sm text-body">
                      {[p.role, p.ageRange && `Age ${p.ageRange}`, p.occupation].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
                    <div>
                      <h4 className="text-caption-upper uppercase text-muted-foreground">Goals</h4>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-body">{p.goals}</p>
                    </div>
                    <div>
                      <h4 className="text-caption-upper uppercase text-muted-foreground">Frustrations</h4>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-body">{p.frustrations}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Section>

        <Section n={5} title="Journey maps">
          {journeyMaps.length === 0 ? (
            <Empty>No journey maps created.</Empty>
          ) : (
            journeyMaps.map((m) => (
              <div key={m.id} className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium text-ink">{m.title}</h3>
                  {m.description && <p className="text-sm text-body">{m.description}</p>}
                </div>
                <ol className="space-y-2">
                  {m.stages.map((s, i) => {
                    const high = s.frictionRating >= HIGH_FRICTION;
                    return (
                      <li
                        key={s.id}
                        className={cn(
                          "break-inside-avoid rounded-lg p-3",
                          high ? "ring-1 ring-primary" : "bg-surface-soft"
                        )}
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                          <span className="text-sm font-medium text-ink">
                            {i + 1}. {s.name}
                          </span>
                          <span className="text-xs text-body">
                            Friction {s.frictionRating}/{FRICTION_MAX} · {FRICTION_LABELS[s.frictionRating]}
                            {s.painType && ` · ${PAIN_LABELS[s.painType]}`}
                            {high && (
                              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-caption-upper uppercase text-primary-foreground">
                                High friction
                              </span>
                            )}
                          </span>
                        </div>
                        {s.description && <p className="mt-1 text-sm leading-relaxed text-body">{s.description}</p>}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))
          )}
        </Section>

        <Section n={6} title="Recommendations">
          {recommendations.length === 0 ? (
            <Empty>No recommendations yet.</Empty>
          ) : (
            Object.values(RecommendationStatus).map((status) => {
              const recs = recommendations.filter((r) => r.status === status);
              if (recs.length === 0) return null;
              return (
                <div key={status} className="space-y-3">
                  <h3 className="text-caption-upper uppercase text-muted-foreground">
                    {STATUS_LABELS[status]} ({recs.length})
                  </h3>
                  <ul className="space-y-4">
                    {recs.map((r) => (
                      <li key={r.id} className="break-inside-avoid space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-medium text-ink">{r.title}</span>
                          <PriorityBadge priority={r.priority} />
                        </div>
                        <p className="text-sm leading-relaxed text-body">{r.description}</p>
                        <p className="text-xs text-muted-foreground">Addresses: {r.finding.title}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </Section>

        <Section n={7} title="Charts">
          {findings.length === 0 && recommendations.length === 0 ? (
            <Empty>No data to chart yet.</Empty>
          ) : (
            <div className="space-y-4">
              <Figure title="Findings by severity" caption="Low to critical.">
                <RampBarChart data={charts.findingsBySeverity} />
              </Figure>
              <Figure title="Findings by category" caption="Which product areas generate the most findings.">
                <FindingsBarChart data={charts.findingsByCategory} />
              </Figure>
              <Figure title="Findings by platform" caption="Findings counted by the source interview's platform.">
                <FindingsBarChart data={charts.findingsByPlatform} />
              </Figure>
              <Figure title="Recommendations by status" caption="Proposed through completed.">
                <RampBarChart data={charts.recommendationsByStatus} />
              </Figure>
              <Figure title="Findings over time" caption="Per week, by the source interview's date.">
                <FindingsTrendChart data={charts.findingsOverTime} />
              </Figure>
            </div>
          )}
        </Section>
      </div>
    </main>
  );
}
