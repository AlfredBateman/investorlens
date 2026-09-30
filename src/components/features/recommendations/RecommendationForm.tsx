"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRecommendation, updateRecommendation, type ActionResult } from "@/server/actions/recommendation";
import { useActionToast } from "@/hooks/use-action-toast";
import type { Recommendation, Finding } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  recommendation?: Recommendation;
  findings: Finding[];
  cancelHref: string;
  defaultFindingId?: string;
};

const INITIAL: ActionResult = {};

export function RecommendationForm({
  recommendation,
  findings,
  cancelHref,
  defaultFindingId,
}: Props) {
  const action = recommendation ? updateRecommendation : createRecommendation;
  const [state, formAction, isPending] = useActionState(action, INITIAL);
  useActionToast(state);

  const errors = state?.error;

  const selectClasses =
    "h-10 w-full rounded-lg border border-input bg-background px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-card dark:disabled:bg-input/80 [&>option]:bg-card [&>option]:text-foreground";

  return (
    <form id="recommendation-form" action={formAction} className="space-y-5" noValidate>
      {recommendation && <input type="hidden" name="id" value={recommendation.id} />}

      {/* Linked Finding */}
      <div className="space-y-1.5">
        <Label
          htmlFor="findingId"
          className={cn(errors?.findingId && "text-destructive")}
        >
          Linked Finding <span aria-hidden className="text-destructive">*</span>
        </Label>
        <select
          id="findingId"
          name="findingId"
          defaultValue={recommendation?.findingId ?? defaultFindingId ?? ""}
          aria-invalid={!!errors?.findingId}
          aria-describedby={errors?.findingId ? "finding-error" : undefined}
          className={selectClasses}
          disabled={!!recommendation || !!defaultFindingId}
        >
          <option value="">Select Finding...</option>
          {findings.map((finding) => (
            <option key={finding.id} value={finding.id}>
              {finding.title} ({finding.severity.toLowerCase()} severity)
            </option>
          ))}
        </select>
        {/* Pass findingId as hidden if disabled (so Zod still parses it on submission) */}
        {(recommendation || defaultFindingId) && (
          <input
            type="hidden"
            name="findingId"
            value={recommendation?.findingId ?? defaultFindingId ?? ""}
          />
        )}
        {errors?.findingId && (
          <p id="finding-error" className="text-xs text-destructive">
            {errors.findingId[0]}
          </p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className={cn(errors?.title && "text-destructive")}>
          Recommendation Title <span aria-hidden className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Resumable KYC with a status tracker"
          defaultValue={recommendation?.title ?? ""}
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
          Description / Action Plan <span aria-hidden className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Detail the actionable steps needed to address the linked finding..."
          defaultValue={recommendation?.description ?? ""}
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
        {/* Priority */}
        <div className="space-y-1.5">
          <Label
            htmlFor="priority"
            className={cn(errors?.priority && "text-destructive")}
          >
            Priority <span aria-hidden className="text-destructive">*</span>
          </Label>
          <select
            id="priority"
            name="priority"
            defaultValue={recommendation?.priority ?? "MEDIUM"}
            aria-invalid={!!errors?.priority}
            aria-describedby={errors?.priority ? "priority-error" : undefined}
            className={selectClasses}
          >
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>
          {errors?.priority && (
            <p id="priority-error" className="text-xs text-destructive">
              {errors.priority[0]}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label
            htmlFor="status"
            className={cn(errors?.status && "text-destructive")}
          >
            Status <span aria-hidden className="text-destructive">*</span>
          </Label>
          <select
            id="status"
            name="status"
            defaultValue={recommendation?.status ?? "PROPOSED"}
            aria-invalid={!!errors?.status}
            aria-describedby={errors?.status ? "status-error" : undefined}
            className={selectClasses}
          >
            <option value="PROPOSED">Proposed</option>
            <option value="APPROVED">Approved</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          {errors?.status && (
            <p id="status-error" className="text-xs text-destructive">
              {errors.status[0]}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={isPending} id="submit-recommendation-form">
          {isPending
            ? recommendation ? "Saving…" : "Creating…"
            : recommendation ? "Save Changes" : "Create Recommendation"}
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
