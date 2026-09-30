"use client";

/**
 * src/components/features/projects/ProjectSelector.tsx
 *
 * The project picker every list page has: a <select> that navigates to the
 * same page with the chosen projectId via router.push(), carrying over only
 * the params listed in `preserveParams` (project-scoped ones like personaId
 * are deliberately dropped when the project changes).
 */

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  /** The list of projects to show in the dropdown. */
  projects: { id: string; name: string }[];
  /** The currently selected project ID (from searchParams). */
  selectedProjectId?: string;
  /** The base pathname for the page (e.g. "/findings", "/personas"). */
  basePath: string;
  /** Search param keys to carry over from the current URL, e.g. ["category", "severity"]. */
  preserveParams?: string[];
};

export function ProjectSelector({ projects, selectedProjectId, basePath, preserveParams = [] }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams();
    if (e.target.value) params.set("projectId", e.target.value);
    for (const key of preserveParams) {
      const existing = searchParams.get(key);
      if (existing) params.set(key, existing);
    }
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <>
      <label htmlFor="projectId-filter-select" className="sr-only">
        Filter by Project
      </label>
      <select
        id="projectId-filter-select"
        value={selectedProjectId ?? ""}
        onChange={handleChange}
        className="h-10 rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">Select Project...</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </>
  );
}
