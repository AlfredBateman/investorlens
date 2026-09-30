"use client";

/**
 * src/app/(app)/error.tsx
 *
 * Error boundary for the (app) route group.
 * Catches unhandled errors in any feature page (dashboard, projects, findings, etc.)
 * and renders a user-friendly fallback UI instead of a white screen.
 */

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console in development for debugging
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-7 text-destructive" aria-hidden />
      </div>
      <h2 className="font-heading text-display-sm text-ink">Something went wrong</h2>
      <p className="mt-1 mb-6 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred while loading this page. You can try again
        or navigate to a different section.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={reset} variant="default">
          Try Again
        </Button>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Go to Dashboard
        </Link>
      </div>
      {error.digest && (
        <p className="mt-4 text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
