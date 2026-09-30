"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFinding, updateFinding, type ActionResult } from "@/server/actions/finding";
import { useActionToast } from "@/hooks/use-action-toast";
import type { Finding } from "@/types";
import { cn } from "@/lib/utils";

type InterviewListItem = {
  id: string;
  candidateName: string;
  candidateRole: string | null;
  candidateCompany: string | null;
  dateConducted: Date;
};

type Props = {
  finding?: Finding;
  projectId: string;
  interviews: InterviewListItem[];
  cancelHref: string;
};

const INITIAL: ActionResult = {};

export function FindingForm({ finding, projectId, interviews, cancelHref }: Props) {
  const action = finding ? updateFinding : createFinding;
  const [state, formAction, isPending] = useActionState(action, INITIAL);
  useActionToast(state);

  const errors = state?.error;

  const selectClasses =
    "h-10 w-full rounded-lg border border-input bg-background px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-card dark:disabled:bg-input/80 [&>option]:bg-card [&>option]:text-foreground";

  return (
    <form id="finding-form" action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="projectId" value={projectId} />
      {finding && <input type="hidden" name="id" value={finding.id} />}

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className={cn(errors?.title && "text-destructive")}>
          Finding Title <span aria-hidden className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Navigation is confusing for first-time users"
          defaultValue={finding?.title ?? ""}
          aria-invalid={!!errors?.title}
          aria-describedby={errors?.title ? "title-error" : undefined}
          autoComplete="off"
          autoFocus
        />
        {errors?.title && (
          <p id="title-error" className="text-xs text-destructive">
            {errors.title[0]}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label
          htmlFor="description"
          className={cn(errors?.description && "text-destructive")}
        >
          Description <span aria-hidden className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Explain what the finding is, including any user quotes or observed behavior..."
          defaultValue={finding?.description ?? ""}
          rows={4}
          aria-invalid={!!errors?.description}
          aria-describedby={errors?.description ? "description-error" : undefined}
          className="resize-none"
        />
        {errors?.description && (
          <p id="description-error" className="text-xs text-destructive">
            {errors.description[0]}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Severity */}
        <div className="space-y-1.5">
          <Label
            htmlFor="severity"
            className={cn(errors?.severity && "text-destructive")}
          >
            Severity Level <span aria-hidden className="text-destructive">*</span>
          </Label>
          <select
            id="severity"
            name="severity"
            defaultValue={finding?.severity ?? "MEDIUM"}
            aria-invalid={!!errors?.severity}
            aria-describedby={errors?.severity ? "severity-error" : undefined}
            className={selectClasses}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          {errors?.severity && (
            <p id="severity-error" className="text-xs text-destructive">
              {errors.severity[0]}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label
            htmlFor="category"
            className={cn(errors?.category && "text-destructive")}
          >
            Category <span aria-hidden className="text-destructive">*</span>
          </Label>
          <select
            id="category"
            name="category"
            defaultValue={finding?.category ?? "OTHER"}
            aria-invalid={!!errors?.category}
            aria-describedby={errors?.category ? "category-error" : undefined}
            className={selectClasses}
          >
            <option value="KYC">KYC</option>
            <option value="ONBOARDING">Onboarding</option>
            <option value="RESEARCH">Research</option>
            <option value="PORTFOLIO">Portfolio</option>
            <option value="SUPPORT">Support</option>
            <option value="OTHER">Other</option>
          </select>
          {errors?.category && (
            <p id="category-error" className="text-xs text-destructive">
              {errors.category[0]}
            </p>
          )}
        </div>
      </div>

      {/* Associated Interview (Optional) */}
      <div className="space-y-1.5">
        <Label
          htmlFor="interviewId"
          className={cn(errors?.interviewId && "text-destructive")}
        >
          Associated Interview{" "}
          <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
        </Label>
        <select
          id="interviewId"
          name="interviewId"
          defaultValue={finding?.interviewId ?? ""}
          aria-invalid={!!errors?.interviewId}
          aria-describedby={errors?.interviewId ? "interview-error" : undefined}
          className={selectClasses}
        >
          <option value="">None / Not derived from a single interview</option>
          {interviews.map((interview) => (
            <option key={interview.id} value={interview.id}>
              {interview.candidateName}{" "}
              {interview.candidateRole ? `(${interview.candidateRole})` : ""}{" "}
              {interview.candidateCompany ? `@ ${interview.candidateCompany}` : ""}
            </option>
          ))}
        </select>
        {errors?.interviewId && (
          <p id="interview-error" className="text-xs text-destructive">
            {errors.interviewId[0]}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={isPending} id="submit-finding-form">
          {isPending
            ? finding ? "Saving…" : "Creating…"
            : finding ? "Save Changes" : "Create Finding"}
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
