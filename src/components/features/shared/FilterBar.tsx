"use client";

/**
 * src/components/features/shared/FilterBar.tsx
 *
 * Declarative filter bar: a debounced search box plus any mix of pill groups,
 * number ranges and selects, all driven by useFilterParams so every control
 * reads and writes the URL directly. One component covers the findings,
 * interviews, recommendations and personas list pages (and the search page's
 * own search box) instead of four hand-rolled bars.
 */

import { useEffect, useState } from "react";
import { useFilterParams } from "@/hooks/use-filter-params";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

type Option = { value: string; label: string };

type PillControl = { type: "pills"; param: string; label: string; options: Option[] };
type SelectControl = { type: "select"; param: string; label: string; options: Option[]; placeholder: string };
type RangeControl = { type: "range"; paramMin: string; paramMax: string; label: string; min: number; max: number };

export type FilterControl = PillControl | SelectControl | RangeControl;

type Props = {
  /** Search param the search box reads/writes, e.g. "q". Omit to hide the box. */
  searchParam?: string;
  searchPlaceholder?: string;
  controls?: FilterControl[];
};

const selectClasses =
  "h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function pillClasses(active: boolean) {
  return cn(
    "rounded-md px-2.5 py-1.5 capitalize transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
    active && "bg-accent text-accent-foreground font-medium"
  );
}

/**
 * The search box's own local draft state, keyed by the URL's current value so
 * an external change (e.g. "Clear Filters") remounts it with fresh state
 * instead of needing an effect to resync a stale draft.
 */
function SearchBox({
  initialValue,
  placeholder,
  onCommit,
}: {
  initialValue: string;
  placeholder?: string;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(initialValue);

  // Debounce free-text search so typing doesn't push a route change per keystroke.
  useEffect(() => {
    const id = setTimeout(() => onCommit(draft), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <div className="relative max-w-sm">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder ?? "Search..."}
        className="h-8 pl-8 text-sm"
        aria-label={placeholder ?? "Search"}
      />
    </div>
  );
}

export function FilterBar({ searchParam, searchPlaceholder, controls = [] }: Props) {
  const { searchParams, setParam, clearParams } = useFilterParams();

  const currentSearch = searchParam ? searchParams.get(searchParam) ?? "" : "";

  const activeKeys = [
    ...(searchParam && currentSearch ? [searchParam] : []),
    ...controls.flatMap((c) =>
      c.type === "range"
        ? [c.paramMin, c.paramMax].filter((k) => searchParams.get(k))
        : searchParams.get(c.param)
          ? [c.param]
          : []
    ),
  ];

  return (
    <div className="space-y-2.5 rounded-lg border border-border bg-card p-3 text-xs">
      {searchParam && (
        <SearchBox
          key={currentSearch}
          initialValue={currentSearch}
          placeholder={searchPlaceholder}
          onCommit={(value) => setParam(searchParam, value || null)}
        />
      )}

      {controls.map((control) => {
        if (control.type === "pills") {
          const active = searchParams.get(control.param);
          return (
            <div key={control.param} role="group" aria-label={control.label} className="flex flex-wrap items-center gap-2">
              <span aria-hidden className="font-medium text-muted-foreground px-1">{control.label}:</span>
              <button type="button" onClick={() => setParam(control.param, null)} aria-pressed={!active} className={pillClasses(!active)}>
                All
              </button>
              {control.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setParam(control.param, opt.value)}
                  aria-pressed={active === opt.value}
                  className={pillClasses(active === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          );
        }

        if (control.type === "select") {
          return (
            <div key={control.param} className="flex flex-wrap items-center gap-2">
              <label htmlFor={`filter-${control.param}`} className="font-medium text-muted-foreground px-1">
                {control.label}:
              </label>
              <select
                id={`filter-${control.param}`}
                value={searchParams.get(control.param) ?? ""}
                onChange={(e) => setParam(control.param, e.target.value || null)}
                className={selectClasses}
              >
                <option value="">{control.placeholder}</option>
                {control.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        // range
        return (
          <div key={control.paramMin} role="group" aria-label={control.label} className="flex flex-wrap items-center gap-2">
            <span aria-hidden className="font-medium text-muted-foreground px-1">{control.label}:</span>
            <input
              type="number"
              inputMode="numeric"
              min={control.min}
              max={control.max}
              defaultValue={searchParams.get(control.paramMin) ?? ""}
              onBlur={(e) => setParam(control.paramMin, e.target.value || null)}
              placeholder="Min"
              aria-label={`${control.label} minimum`}
              className="h-8 w-16 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <span className="text-muted-foreground" aria-hidden>
              –
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={control.min}
              max={control.max}
              defaultValue={searchParams.get(control.paramMax) ?? ""}
              onBlur={(e) => setParam(control.paramMax, e.target.value || null)}
              placeholder="Max"
              aria-label={`${control.label} maximum`}
              className="h-8 w-16 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        );
      })}

      {activeKeys.length > 0 && (
        <button
          type="button"
          onClick={() => clearParams(activeKeys)}
          className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-destructive outline-none hover:bg-destructive/10 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <X className="size-3" />
          Clear Filters
        </button>
      )}
    </div>
  );
}
