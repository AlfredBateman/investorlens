/**
 * src/components/features/projects/ProjectStatCard.tsx
 *
 * Server Component — a simple stat card used on the project detail page
 * to display a single metric with an icon.
 */

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number;
  icon: LucideIcon;
  className?: string;
};

export function ProjectStatCard({ label, value, icon: Icon, className }: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border bg-card p-4",
        className
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <p className="text-2xl font-medium leading-none text-card-foreground">
          {value}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
