/**
 * src/app/(app)/loading.tsx
 *
 * Default loading skeleton for all pages in the (app) route group.
 * Shows a pulsing skeleton UI while RSC pages are streaming.
 */

export default function AppLoading() {
  return (
    <div role="status" aria-label="Loading" className="animate-pulse space-y-6">
      <span className="sr-only">Loading…</span>
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-md bg-muted" />
        <div className="h-4 w-72 rounded-md bg-muted" />
      </div>

      {/* Content cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}
