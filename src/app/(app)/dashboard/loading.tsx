/**
 * src/app/(app)/dashboard/loading.tsx
 *
 * Dashboard-specific loading skeleton that mirrors the stat card + chart layout.
 */

export default function DashboardLoading() {
  return (
    <div role="status" aria-label="Loading" className="animate-pulse space-y-8">
      <span className="sr-only">Loading…</span>
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-32 rounded-md bg-muted" />
        <div className="h-4 w-64 rounded-md bg-muted" />
      </div>

      {/* Section label */}
      <div className="space-y-3">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
            >
              <div className="size-12 rounded-xl bg-muted" />
              <div className="space-y-2">
                <div className="h-7 w-12 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-72 rounded-xl border border-border bg-card" />
        <div className="h-72 rounded-xl border border-border bg-card" />
      </div>
    </div>
  );
}
