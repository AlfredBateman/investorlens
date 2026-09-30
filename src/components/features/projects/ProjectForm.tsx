"use client";

/**
 * src/components/features/projects/ProjectForm.tsx
 *
 * Reusable form for creating and editing a Project.
 *
 * Client Component — uses useActionState (React 19) for pending state and
 * field-level error display. The `project` prop controls create vs edit mode.
 *
 * Note: Button is from @base-ui/react which uses a `render` prop for polymorphism,
 * not `asChild`. Navigation links are rendered as plain <a> elements styled
 * with buttonVariants.
 */

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProject, updateProject, type ActionResult } from "@/server/actions/project";
import { useActionToast } from "@/hooks/use-action-toast";
import type { ProjectWithCounts } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  project?: ProjectWithCounts;
  cancelHref: string;
};

const INITIAL: ActionResult = {};

export function ProjectForm({ project, cancelHref }: Props) {
  const action = project ? updateProject : createProject;
  const [state, formAction, isPending] = useActionState(action, INITIAL);
  useActionToast(state);

  const errors = state?.error;

  return (
    <form id="project-form" action={formAction} className="space-y-5" noValidate>
      {project && (
        <>
          <input type="hidden" name="id" value={project.id} />
          <input type="hidden" name="status" value={project.status} />
        </>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name" className={cn(errors?.name && "text-destructive")}>
          Project Name <span aria-hidden className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Retail Investor UX Research"
          defaultValue={project?.name ?? ""}
          aria-invalid={!!errors?.name}
          aria-describedby={errors?.name ? "name-error" : undefined}
          autoComplete="off"
          autoFocus
        />
        {errors?.name && (
          <p id="name-error" className="text-xs text-destructive">
            {errors.name[0]}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="description"
          className={cn(errors?.description && "text-destructive")}
        >
          Description{" "}
          <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What is this project about?"
          defaultValue={project?.description ?? ""}
          rows={3}
          aria-invalid={!!errors?.description}
          aria-describedby={errors?.description ? "desc-error" : undefined}
          className="resize-none"
        />
        {errors?.description && (
          <p id="desc-error" className="text-xs text-destructive">
            {errors.description[0]}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={isPending} id="submit-project-form">
          {isPending
            ? project ? "Saving…" : "Creating…"
            : project ? "Save Changes" : "Create Project"}
        </Button>
        <Link
          href={cancelHref}
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
