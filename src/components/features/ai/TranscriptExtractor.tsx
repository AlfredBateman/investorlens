"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SeverityBadge } from "@/components/features/findings/SeverityBadge";
import { useActionToast } from "@/hooks/use-action-toast";
import { toast } from "@/components/ui/toast";
import { applySuggestions, extractSuggestions, type ExtractState } from "@/server/actions/ai";
import type { ActionResult } from "@/server/actions/types";
import type { Suggestion } from "@/server/ai/transcript";
import { SEVERITY_LABELS } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { FileUp, Sparkles } from "lucide-react";

type Props = {
  projectId: string;
  interviews: { id: string; candidateName: string }[];
  findings: { id: string; title: string }[];
};

const CATEGORY_OPTIONS = ["KYC", "ONBOARDING", "RESEARCH", "PORTFOLIO", "SUPPORT", "OTHER"] as const;
const MAX_FILE_BYTES = 200_000;

const selectClasses =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function TranscriptExtractor({ projectId, interviews, findings }: Props) {
  const [state, extractAction, extracting] = useActionState<ExtractState, FormData>(extractSuggestions, {});
  const [transcript, setTranscript] = useState("");
  const [interviewId, setInterviewId] = useState("");

  async function loadFile(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      toast.error("That file is too large. Paste an excerpt instead (60,000 characters max).");
      return;
    }
    setTranscript(await file.text());
  }

  return (
    <div className="space-y-8">
      <form action={extractAction} className="space-y-5 rounded-xl border border-border bg-card p-6" noValidate>
        <input type="hidden" name="projectId" value={projectId} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="interviewId">
              Interview <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <select
              id="interviewId"
              name="interviewId"
              value={interviewId}
              onChange={(e) => setInterviewId(e.target.value)}
              className={selectClasses}
            >
              <option value="">Not linked to an interview</option>
              {interviews.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.candidateName}
                </option>
              ))}
            </select>
            {state.error?.interviewId && <p className="text-xs text-destructive">{state.error.interviewId[0]}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="transcript-file">Upload transcript</Label>
            <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input px-3 text-sm text-body hover:bg-surface-soft focus-within:ring-3 focus-within:ring-ring/50">
              <FileUp className="size-4 shrink-0" aria-hidden />
              <span className="truncate">Choose a .txt or .md file</span>
              <input
                id="transcript-file"
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                className="sr-only"
                onChange={(e) => loadFile(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="transcript" className={cn(state.error?.transcript && "text-destructive")}>
            Transcript <span aria-hidden className="text-destructive">*</span>
          </Label>
          <Textarea
            id="transcript"
            name="transcript"
            rows={10}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste the interview transcript here…"
            aria-invalid={!!state.error?.transcript}
            aria-describedby="transcript-help"
            className="max-h-96"
          />
          <p id="transcript-help" className="text-xs text-muted-foreground">
            {transcript.length.toLocaleString()} / 60,000 characters
          </p>
          {state.error?.transcript && <p className="text-xs text-destructive">{state.error.transcript[0]}</p>}
        </div>

        <Button type="submit" disabled={extracting} className="gap-1.5">
          <Sparkles className="size-4" aria-hidden />
          {extracting ? "Analysing transcript…" : "Extract pain points"}
        </Button>

        {/* Inline, not a toast: extraction failures (bad key, network, malformed reply) need to stay visible. */}
        {state.message && !state.error && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {state.message}
          </p>
        )}
      </form>

      {state.suggestions && state.suggestions.length > 0 && (
        <SuggestionReview
          key={state.runId}
          projectId={projectId}
          interviewId={interviewId}
          suggestions={state.suggestions}
          findings={findings}
        />
      )}
    </div>
  );
}

type Decision = "approve" | "reject" | undefined;

function SuggestionReview({
  projectId,
  interviewId,
  suggestions,
  findings,
}: {
  projectId: string;
  interviewId: string;
  suggestions: Suggestion[];
  findings: { id: string; title: string }[];
}) {
  const [state, applyAction, saving] = useActionState<ActionResult, FormData>(applySuggestions, {});
  useActionToast(state);
  const [decisions, setDecisions] = useState<Decision[]>(() => suggestions.map(() => undefined));
  const [edits, setEdits] = useState(() =>
    suggestions.map((s) => ({ title: s.title, category: s.category, severity: s.severity }))
  );

  const findingTitle = new Map(findings.map((f) => [f.id, f.title]));
  const approved = decisions.filter((d) => d === "approve").length;
  const rejected = decisions.filter((d) => d === "reject").length;

  const decisionsJson = JSON.stringify(
    suggestions.flatMap((s, i): object[] => {
      if (decisions[i] !== "approve") return [];
      return s.matchedFindingId
        ? [{ kind: "match", findingId: s.matchedFindingId, quote: s.quote }]
        : [{ kind: "new", ...edits[i], description: `${s.summary}\n\nSupporting quote: "${s.quote}"` }];
    })
  );

  const decide = (i: number, d: Decision) => setDecisions((prev) => prev.map((x, j) => (j === i ? d : x)));

  return (
    <section aria-labelledby="review-heading" className="space-y-4">
      <div>
        <h2 id="review-heading" className="font-heading text-display-sm text-ink">
          Review suggestions
        </h2>
        <p className="mt-1 text-sm text-body">
          Nothing is saved until you approve suggestions and click save. Approving a match adds the quote to that
          finding as supporting evidence; approving a new one creates a finding.
        </p>
      </div>

      <ol className="space-y-3">
        {suggestions.map((s, i) => {
          const d = decisions[i];
          const matched = s.matchedFindingId ? findingTitle.get(s.matchedFindingId) : null;
          return (
            <li
              key={i}
              className={cn(
                "space-y-3 rounded-xl border p-5 transition-colors",
                d === "approve" ? "border-primary bg-background" : "border-border bg-card",
                d === "reject" && "opacity-60"
              )}
            >
              <blockquote className="border-l-2 border-hairline pl-3 text-sm italic text-body">&ldquo;{s.quote}&rdquo;</blockquote>
              {!s.verbatim && (
                <p className="text-xs text-destructive">
                  This quote doesn&apos;t appear word-for-word in the transcript. Check it before approving.
                </p>
              )}
              <p className="text-sm text-ink">{s.summary}</p>

              {matched ? (
                <p className="text-sm text-body">
                  <span className="text-caption-upper uppercase text-muted-foreground">Matches</span>{" "}
                  <Link href={`/findings/${s.matchedFindingId}`} target="_blank" className="text-primary underline-offset-2 hover:underline">
                    {matched}
                  </Link>
                </p>
              ) : (
                <fieldset className="space-y-2">
                  <legend className="text-caption-upper uppercase text-muted-foreground">
                    New finding <SeverityBadge severity={edits[i].severity} className="ml-1 align-middle normal-case" />
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-[1fr_9rem_8rem]">
                    <Input
                      value={edits[i].title}
                      onChange={(e) => setEdits((p) => p.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                      aria-label={`Suggestion ${i + 1} finding title`}
                    />
                    <select
                      value={edits[i].category}
                      onChange={(e) =>
                        setEdits((p) => p.map((x, j) => (j === i ? { ...x, category: e.target.value as Suggestion["category"] } : x)))
                      }
                      aria-label={`Suggestion ${i + 1} category`}
                      className={selectClasses}
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0) + c.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                    <select
                      value={edits[i].severity}
                      onChange={(e) =>
                        setEdits((p) => p.map((x, j) => (j === i ? { ...x, severity: e.target.value as Suggestion["severity"] } : x)))
                      }
                      aria-label={`Suggestion ${i + 1} severity`}
                      className={selectClasses}
                    >
                      {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </fieldset>
              )}

              <fieldset className="flex gap-2">
                <legend className="sr-only">Decision for suggestion {i + 1}</legend>
                {(["approve", "reject"] as const).map((choice) => (
                  <label key={choice} className="cursor-pointer">
                    <input
                      type="radio"
                      name={`decision-${i}`}
                      className="peer sr-only"
                      checked={d === choice}
                      onChange={() => decide(i, choice)}
                    />
                    <span
                      className={cn(
                        "inline-flex h-8 items-center rounded-lg border px-3 text-sm font-medium capitalize transition-colors peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
                        d === choice
                          ? choice === "approve"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-ink/30 bg-surface-card text-ink"
                          : "border-border text-body hover:bg-surface-soft"
                      )}
                    >
                      {choice}
                    </span>
                  </label>
                ))}
              </fieldset>
            </li>
          );
        })}
      </ol>

      <form
        action={applyAction}
        className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/95 p-4 backdrop-blur"
      >
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="interviewId" value={interviewId} />
        <input type="hidden" name="decisionsJson" value={decisionsJson} />
        <p className="text-sm text-body" aria-live="polite">
          {approved} approved · {rejected} rejected · {suggestions.length - approved - rejected} undecided
        </p>
        <Button type="submit" disabled={saving || approved === 0}>
          {saving ? "Saving…" : `Save ${approved} approved`}
        </Button>
      </form>
    </section>
  );
}
