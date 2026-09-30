import type { Metadata } from "next";
import { ProjectForm } from "@/components/features/projects/ProjectForm";

/**
 * src/app/(app)/projects/new/page.tsx — /projects/new
 *
 * Server Component page that renders the project creation form.
 * The form itself (ProjectForm) is a Client Component to handle
 * useActionState and pending states.
 */

export const metadata: Metadata = {
  title: "New Project",
  description: "Create a new UX research project.",
};

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-heading text-display-sm text-ink">New Project</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Create a project to start organizing your research.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <ProjectForm cancelHref="/projects" />
      </div>
    </div>
  );
}
