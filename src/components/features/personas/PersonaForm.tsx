"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPersona, updatePersona, type ActionResult } from "@/server/actions/persona";
import { useActionToast } from "@/hooks/use-action-toast";
import type { Persona } from "@/types";
import { cn } from "@/lib/utils";

type InterviewListItem = {
  id: string;
  candidateName: string;
  candidateRole: string | null;
  candidateCompany: string | null;
  dateConducted: Date;
};

type PersonaWithInterviews = Persona & {
  interviews?: {
    interviewId: string;
  }[];
};

type Props = {
  persona?: PersonaWithInterviews;
  projectId: string;
  interviews: InterviewListItem[];
  cancelHref: string;
};

const INITIAL: ActionResult = {};

export function PersonaForm({ persona, projectId, interviews, cancelHref }: Props) {
  const action = persona ? updatePersona : createPersona;
  const [state, formAction, isPending] = useActionState(action, INITIAL);
  useActionToast(state);

  const errors = state?.error;

  const initialSelected = persona?.interviews?.map((i) => i.interviewId) ?? [];

  return (
    <form id="persona-form" action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="projectId" value={projectId} />
      {persona && <input type="hidden" name="id" value={persona.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className={cn(errors?.name && "text-destructive")}>
            Persona Name <span aria-hidden className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. New Investor"
            defaultValue={persona?.name ?? ""}
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

        {/* Occupation / Role */}
        <div className="space-y-1.5">
          <Label htmlFor="role" className={cn(errors?.role && "text-destructive")}>
            Role <span aria-hidden className="text-destructive">*</span>
          </Label>
          <Input
            id="role"
            name="role"
            placeholder="e.g. First-time retail investor"
            defaultValue={persona?.role ?? ""}
            aria-invalid={!!errors?.role}
            aria-describedby={errors?.role ? "role-error" : undefined}
            autoComplete="off"
          />
          {errors?.role && (
            <p id="role-error" className="text-xs text-destructive">
              {errors.role[0]}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Age Range */}
        <div className="space-y-1.5">
          <Label
            htmlFor="ageRange"
            className={cn(errors?.ageRange && "text-destructive")}
          >
            Age Range
          </Label>
          <Input
            id="ageRange"
            name="ageRange"
            placeholder="e.g. 25-34"
            defaultValue={persona?.ageRange ?? ""}
            aria-invalid={!!errors?.ageRange}
            aria-describedby={errors?.ageRange ? "ageRange-error" : undefined}
            autoComplete="off"
          />
          {errors?.ageRange && (
            <p id="ageRange-error" className="text-xs text-destructive">
              {errors.ageRange[0]}
            </p>
          )}
        </div>

        {/* Occupation */}
        <div className="space-y-1.5">
          <Label
            htmlFor="occupation"
            className={cn(errors?.occupation && "text-destructive")}
          >
            Occupation
          </Label>
          <Input
            id="occupation"
            name="occupation"
            placeholder="e.g. Software engineer"
            defaultValue={persona?.occupation ?? ""}
            aria-invalid={!!errors?.occupation}
            aria-describedby={errors?.occupation ? "occupation-error" : undefined}
            autoComplete="off"
          />
          {errors?.occupation && (
            <p id="occupation-error" className="text-xs text-destructive">
              {errors.occupation[0]}
            </p>
          )}
        </div>

        {/* Avatar URL (optional) */}
        <div className="space-y-1.5">
          <Label
            htmlFor="avatarUrl"
            className={cn(errors?.avatarUrl && "text-destructive")}
          >
            Avatar Image URL{" "}
            <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="avatarUrl"
            name="avatarUrl"
            placeholder="https://example.com/avatar.jpg"
            defaultValue={persona?.avatarUrl ?? ""}
            aria-invalid={!!errors?.avatarUrl}
            aria-describedby={errors?.avatarUrl ? "avatarUrl-error" : undefined}
            autoComplete="off"
          />
          {errors?.avatarUrl && (
            <p id="avatarUrl-error" className="text-xs text-destructive">
              {errors.avatarUrl[0]}
            </p>
          )}
        </div>
      </div>

      {/* Goals */}
      <div className="space-y-1.5">
        <Label htmlFor="goals" className={cn(errors?.goals && "text-destructive")}>
          Goals <span aria-hidden className="text-destructive">*</span>
        </Label>
        <Textarea
          id="goals"
          name="goals"
          placeholder="What is this user trying to achieve? (goals, motivations, needs)"
          defaultValue={persona?.goals ?? ""}
          rows={3}
          aria-invalid={!!errors?.goals}
          aria-describedby={errors?.goals ? "goals-error" : undefined}
          className="resize-none"
        />
        {errors?.goals && (
          <p id="goals-error" className="text-xs text-destructive">
            {errors.goals[0]}
          </p>
        )}
      </div>

      {/* Frustrations */}
      <div className="space-y-1.5">
        <Label
          htmlFor="frustrations"
          className={cn(errors?.frustrations && "text-destructive")}
        >
          Frustrations <span aria-hidden className="text-destructive">*</span>
        </Label>
        <Textarea
          id="frustrations"
          name="frustrations"
          placeholder="What pain points, barriers, or worries does this user experience?"
          defaultValue={persona?.frustrations ?? ""}
          rows={3}
          aria-invalid={!!errors?.frustrations}
          aria-describedby={errors?.frustrations ? "frustrations-error" : undefined}
          className="resize-none"
        />
        {errors?.frustrations && (
          <p id="frustrations-error" className="text-xs text-destructive">
            {errors.frustrations[0]}
          </p>
        )}
      </div>

      {/* Derived From Interviews (Multi-select / Checkboxes) */}
      <div className="space-y-2">
        <Label className={cn(errors?.interviewIds && "text-destructive")}>
          Derived From Interviews{" "}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (select all that apply)
          </span>
        </Label>
        {interviews.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 rounded-lg border border-border p-4 bg-muted/30">
            {interviews.map((interview) => (
              <label
                key={interview.id}
                className="flex items-start gap-2.5 rounded-md border border-border/50 bg-card p-2.5 text-sm transition-colors hover:bg-accent cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="interviewIds"
                  value={interview.id}
                  defaultChecked={initialSelected.includes(interview.id)}
                  className="mt-0.5 rounded border-input text-primary focus:ring-ring"
                />
                <div className="min-w-0 leading-tight">
                  <span className="font-medium block truncate">
                    {interview.candidateName}
                  </span>
                  <span className="text-[11px] text-muted-foreground block truncate">
                    {interview.candidateRole}
                    {interview.candidateRole && interview.candidateCompany && " at "}
                    {interview.candidateCompany}
                  </span>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic rounded-lg border border-dashed border-border p-4 text-center">
            No interviews found in this project. Create interviews first to derive personas from them.
          </p>
        )}
        {errors?.interviewIds && (
          <p className="text-xs text-destructive">{errors.interviewIds[0]}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={isPending} id="submit-persona-form">
          {isPending
            ? persona ? "Saving…" : "Creating…"
            : persona ? "Save Changes" : "Create Persona"}
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
