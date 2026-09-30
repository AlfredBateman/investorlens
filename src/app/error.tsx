"use client";

/**
 * src/app/error.tsx
 *
 * Root-level error boundary.
 * Catches errors that escape the (app) route group boundary (e.g., layout-level errors).
 */

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RootError]", error);
  }, [error]);

  return (
    <div role="alert" className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h2 className="font-heading text-display-sm text-ink">Something went wrong</h2>
      <p className="mt-2 mb-6 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred. Please try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
      {error.digest && (
        <p className="mt-4 text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
