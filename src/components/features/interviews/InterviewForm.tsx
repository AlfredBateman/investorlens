"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createInterview, updateInterview, type ActionResult } from "@/server/actions/interview";
import { useActionToast } from "@/hooks/use-action-toast";
import { PLATFORM_LABELS } from "@/lib/platform-labels";
import type { Interview } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  interview?: Interview;
  projectId: string;
  cancelHref: string;
};

const INITIAL: ActionResult = {};

/** Formats a Date as "YYYY-MM-DD" for an <input type="date"> defaultValue. */
function toDateInputValue(date?: Date): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function InterviewForm({ interview, projectId, cancelHref }: Props) {
  const action = interview ? updateInterview : createInterview;
  const [state, formAction, isPending] = useActionState(action, INITIAL);
  useActionToast(state);

  const errors = state?.error;

  const selectClasses =
    "h-10 w-full rounded-lg border border-input bg-background px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-card dark:disabled:bg-input/80 [&>option]:bg-card [&>option]:text-foreground";

  return (
    <form id="interview-form" action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="projectId" value={projectId} />
      {interview && <input type="hidden" name="id" value={interview.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Participant name */}
        <div className="space-y-1.5">
          <Label htmlFor="candidateName" className={cn(errors?.candidateName && "text-destructive")}>
            Participant Name <span aria-hidden className="text-destructive">*</span>
          </Label>
          <Input
            id="candidateName"
            name="candidateName"
            placeholder="e.g. Aarav Mehta"
            defaultValue={interview?.candidateName ?? ""}
            aria-invalid={!!errors?.candidateName}
            aria-describedby={errors?.candidateName ? "candidateName-error" : undefined}
            autoComplete="off"
            autoFocus
          />
          {errors?.candidateName && (
            <p id="candidateName-error" className="text-xs text-destructive">
              {errors.candidateName[0]}
            </p>
          )}
        </div>

        {/* Age */}
        <div className="space-y-1.5">
          <Label htmlFor="age" className={cn(errors?.age && "text-destructive")}>
            Age <span aria-hidden className="text-destructive">*</span>
          </Label>
          <Input
            id="age"
            name="age"
            type="number"
            min={18}
            max={100}
            placeholder="e.g. 28"
            defaultValue={interview?.age ?? ""}
            aria-invalid={!!errors?.age}
            aria-describedby={errors?.age ? "age-error" : undefined}
          />
          {errors?.age && (
            <p id="age-error" className="text-xs text-destructive">
              {errors.age[0]}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Occupation */}
        <div className="space-y-1.5">
          <Label htmlFor="candidateRole" className={cn(errors?.candidateRole && "text-destructive")}>
            Occupation{" "}
            <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="candidateRole"
            name="candidateRole"
            placeholder="e.g. Junior software engineer"
            defaultValue={interview?.candidateRole ?? ""}
            aria-invalid={!!errors?.candidateRole}
            aria-describedby={errors?.candidateRole ? "candidateRole-error" : undefined}
            autoComplete="off"
          />
          {errors?.candidateRole && (
            <p id="candidateRole-error" className="text-xs text-destructive">
              {errors.candidateRole[0]}
            </p>
          )}
        </div>

        {/* Company (optional) */}
        <div className="space-y-1.5">
          <Label htmlFor="candidateCompany" className={cn(errors?.candidateCompany && "text-destructive")}>
            Employer{" "}
            <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="candidateCompany"
            name="candidateCompany"
            placeholder="e.g. Infosys"
            defaultValue={interview?.candidateCompany ?? ""}
            aria-invalid={!!errors?.candidateCompany}
            aria-describedby={errors?.candidateCompany ? "candidateCompany-error" : undefined}
            autoComplete="off"
          />
          {errors?.candidateCompany && (
            <p id="candidateCompany-error" className="text-xs text-destructive">
              {errors.candidateCompany[0]}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Platform */}
        <div className="space-y-1.5">
          <Label htmlFor="platform" className={cn(errors?.platform && "text-destructive")}>
            Platform Used <span aria-hidden className="text-destructive">*</span>
          </Label>
          <select
            id="platform"
            name="platform"
            defaultValue={interview?.platform ?? "ZERODHA"}
            aria-invalid={!!errors?.platform}
            aria-describedby={errors?.platform ? "platform-error" : undefined}
            className={selectClasses}
          >
            {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors?.platform && (
            <p id="platform-error" className="text-xs text-destructive">
              {errors.platform[0]}
            </p>
          )}
        </div>

        {/* Date conducted */}
        <div className="space-y-1.5">
          <Label htmlFor="dateConducted" className={cn(errors?.dateConducted && "text-destructive")}>
            Interview Date <span aria-hidden className="text-destructive">*</span>
          </Label>
          <Input
            id="dateConducted"
            name="dateConducted"
            type="date"
            defaultValue={toDateInputValue(interview?.dateConducted)}
            aria-invalid={!!errors?.dateConducted}
            aria-describedby={errors?.dateConducted ? "dateConducted-error" : undefined}
          />
          {errors?.dateConducted && (
            <p id="dateConducted-error" className="text-xs text-destructive">
              {errors.dateConducted[0]}
            </p>
          )}
        </div>
      </div>

      {/* Investing behavior */}
      <div className="space-y-1.5">
        <Label htmlFor="investingBehavior" className={cn(errors?.investingBehavior && "text-destructive")}>
          Investing Behavior{" "}
          <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="investingBehavior"
          name="investingBehavior"
          placeholder="How does this person currently invest — frequency, amounts, habits?"
          defaultValue={interview?.investingBehavior ?? ""}
          rows={2}
          aria-invalid={!!errors?.investingBehavior}
          aria-describedby={errors?.investingBehavior ? "investingBehavior-error" : undefined}
          className="resize-none"
        />
        {errors?.investingBehavior && (
          <p id="investingBehavior-error" className="text-xs text-destructive">
            {errors.investingBehavior[0]}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Goals */}
        <div className="space-y-1.5">
          <Label htmlFor="goals" className={cn(errors?.goals && "text-destructive")}>
            Goals{" "}
            <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="goals"
            name="goals"
            placeholder="What is this participant trying to achieve?"
            defaultValue={interview?.goals ?? ""}
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
          <Label htmlFor="frustrations" className={cn(errors?.frustrations && "text-destructive")}>
            Frustrations{" "}
            <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="frustrations"
            name="frustrations"
            placeholder="What pain points came up during the interview?"
            defaultValue={interview?.frustrations ?? ""}
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
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notesText" className={cn(errors?.notesText && "text-destructive")}>
          Interview Notes <span aria-hidden className="text-destructive">*</span>
        </Label>
        <Textarea
          id="notesText"
          name="notesText"
          placeholder="Full session notes, observations and quotes..."
          defaultValue={interview?.notesText ?? ""}
          rows={8}
          aria-invalid={!!errors?.notesText}
          aria-describedby={errors?.notesText ? "notesText-error" : undefined}
        />
        {errors?.notesText && (
          <p id="notesText-error" className="text-xs text-destructive">
            {errors.notesText[0]}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={isPending} id="submit-interview-form">
          {isPending
            ? interview ? "Saving…" : "Creating…"
            : interview ? "Save Changes" : "Create Interview"}
        </Button>
        <Link href={cancelHref} className={cn(buttonVariants({ variant: "ghost" }))}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
