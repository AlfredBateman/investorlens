"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { PainPointType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createJourneyMap,
  updateJourneyMap,
  type ActionResult,
} from "@/server/actions/journeyMap";
import { useActionToast } from "@/hooks/use-action-toast";
import { FRICTION_LABELS, HIGH_FRICTION, PAIN_LABELS } from "@/lib/friction";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

type StageRow = {
  key: number;
  name: string;
  description: string;
  painType: string;
  frictionRating: number;
  findingIds: string[];
  personaIds: string[];
};

// Stable React keys for rows so reordering/removing doesn't remount the wrong inputs.
let nextKey = 0;
const blankStage = (): StageRow => ({
  key: nextKey++,
  name: "",
  description: "",
  painType: "",
  frictionRating: 0,
  findingIds: [],
  personaIds: [],
});

type JourneyMapWithStages = {
  id: string;
  title: string;
  description: string | null;
  stages: {
    name: string;
    description: string | null;
    painType: PainPointType | null;
    frictionRating: number;
    findings: { id: string }[];
    personas: { id: string }[];
  }[];
};

type Props = {
  journeyMap?: JourneyMapWithStages;
  projectId: string;
  personas: { id: string; name: string }[];
  findings: { id: string; title: string }[];
  cancelHref: string;
};

const INITIAL: ActionResult = {};

const toggle = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

/** A native checkbox styled as a pill; the check icon keeps selection visible without relying on color. */
function TogglePill({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="cursor-pointer">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
      <span
        className={cn(
          "inline-flex max-w-60 items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
          "peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
          checked ? "border-ink/40 bg-background text-ink" : "border-hairline text-body"
        )}
      >
        {checked && <Check className="size-3 shrink-0" aria-hidden />}
        <span className="truncate">{children}</span>
      </span>
    </label>
  );
}

export function JourneyMapForm({ journeyMap, projectId, personas, findings, cancelHref }: Props) {
  const action = journeyMap ? updateJourneyMap : createJourneyMap;
  const [state, formAction, isPending] = useActionState(action, INITIAL);
  useActionToast(state);

  const [stages, setStages] = useState<StageRow[]>(() =>
    journeyMap && journeyMap.stages.length > 0
      ? journeyMap.stages.map((s) => ({
          key: nextKey++,
          name: s.name,
          description: s.description ?? "",
          painType: s.painType ?? "",
          frictionRating: s.frictionRating,
          findingIds: s.findings.map((f) => f.id),
          personaIds: s.personas.map((p) => p.id),
        }))
      : [blankStage()]
  );

  const errors = state?.error;
  const stagesError = errors?.stages?.[0];

  const selectClasses =
    "h-10 w-full rounded-lg border border-input bg-background px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

  function updateStage(index: number, patch: Partial<StageRow>) {
    setStages((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function moveStage(index: number, delta: -1 | 1) {
    setStages((prev) => {
      const next = [...prev];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });
  }

  return (
    <form id="journey-map-form" action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="projectId" value={projectId} />
      {journeyMap && <input type="hidden" name="id" value={journeyMap.id} />}
      <input
        type="hidden"
        name="stagesJson"
        value={JSON.stringify(
          stages.map((s) => ({
            name: s.name,
            description: s.description || undefined,
            painType: s.painType || undefined,
            frictionRating: s.frictionRating,
            findingIds: s.findingIds,
            personaIds: s.personaIds,
          }))
        )}
      />

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className={cn(errors?.title && "text-destructive")}>
          Map Title <span aria-hidden className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. First investment journey"
          defaultValue={journeyMap?.title ?? ""}
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
        <Label htmlFor="description" className={cn(errors?.description && "text-destructive")}>
          Description{" "}
          <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What workflow does this journey map cover?"
          defaultValue={journeyMap?.description ?? ""}
          rows={2}
          aria-invalid={!!errors?.description}
          className="resize-none"
        />
        {errors?.description && (
          <p className="text-xs text-destructive">{errors.description[0]}</p>
        )}
      </div>

      {/* Stages */}
      <fieldset className="space-y-3">
        <legend className={cn("mb-1 text-sm font-medium", stagesError && "text-destructive")}>
          Journey Stages
        </legend>

        <ol className="space-y-3">
          {stages.map((stage, index) => {
            const n = index + 1;
            return (
              <li
                key={stage.key}
                className={cn(
                  "space-y-3 rounded-xl p-4",
                  stage.frictionRating >= HIGH_FRICTION
                    ? "bg-background ring-1 ring-primary"
                    : "bg-surface-card"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-hairline bg-background text-xs font-medium text-ink">
                    {n}
                  </span>
                  <Input
                    value={stage.name}
                    onChange={(e) => updateStage(index, { name: e.target.value })}
                    placeholder="Stage name, e.g. KYC"
                    aria-label={`Stage ${n} name`}
                    className="flex-1 bg-background"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => moveStage(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move stage ${n} earlier`}
                  >
                    <ChevronUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => moveStage(index, 1)}
                    disabled={index === stages.length - 1}
                    aria-label={`Move stage ${n} later`}
                  >
                    <ChevronDown className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setStages((prev) => prev.filter((_, i) => i !== index))}
                    disabled={stages.length <= 1}
                    aria-label={`Remove stage ${n}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                <Textarea
                  value={stage.description}
                  onChange={(e) => updateStage(index, { description: e.target.value })}
                  placeholder="What happens at this stage, and what participants struggle with"
                  rows={2}
                  className="resize-none bg-background"
                  aria-label={`Stage ${n} description`}
                />

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-xs text-body">Friction rating</span>
                    <select
                      value={stage.frictionRating}
                      onChange={(e) => updateStage(index, { frictionRating: Number(e.target.value) })}
                      className={selectClasses}
                    >
                      {FRICTION_LABELS.map((label, rating) => (
                        <option key={rating} value={rating}>
                          {rating} — {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-body">Pain type</span>
                    <select
                      value={stage.painType}
                      onChange={(e) => updateStage(index, { painType: e.target.value })}
                      className={selectClasses}
                    >
                      <option value="">Not specified</option>
                      {Object.entries(PAIN_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {findings.length > 0 && (
                  <fieldset>
                    <legend className="mb-1.5 text-xs text-body">Linked findings</legend>
                    <div className="flex flex-wrap gap-1.5">
                      {findings.map((f) => (
                        <TogglePill
                          key={f.id}
                          checked={stage.findingIds.includes(f.id)}
                          onChange={() =>
                            updateStage(index, { findingIds: toggle(stage.findingIds, f.id) })
                          }
                        >
                          {f.title}
                        </TogglePill>
                      ))}
                    </div>
                  </fieldset>
                )}

                {personas.length > 0 && (
                  <fieldset>
                    <legend className="mb-1.5 text-xs text-body">Affected personas</legend>
                    <div className="flex flex-wrap gap-1.5">
                      {personas.map((p) => (
                        <TogglePill
                          key={p.id}
                          checked={stage.personaIds.includes(p.id)}
                          onChange={() =>
                            updateStage(index, { personaIds: toggle(stage.personaIds, p.id) })
                          }
                        >
                          {p.name}
                        </TogglePill>
                      ))}
                    </div>
                  </fieldset>
                )}
              </li>
            );
          })}
        </ol>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setStages((prev) => [...prev, blankStage()])}
          className="gap-1.5"
        >
          <Plus className="size-3.5" />
          Add Stage
        </Button>

        {stagesError && <p className="text-xs text-destructive">{stagesError}</p>}
      </fieldset>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={isPending} id="submit-journey-map-form">
          {isPending
            ? journeyMap ? "Saving…" : "Creating…"
            : journeyMap ? "Save Changes" : "Create Journey Map"}
        </Button>
        <Link href={cancelHref} className={cn(buttonVariants({ variant: "ghost" }))}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
