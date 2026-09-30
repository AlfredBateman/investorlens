import { ShieldCheck, UserPlus, Search, ChartPie, LifeBuoy, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  category: string;
  className?: string;
};

// Category is nominal (identity, not magnitude), so it stays neutral: the icon
// and label tell categories apart, and coral is kept for the scales that rank.
const CATEGORIES = {
  KYC: { label: "KYC", icon: ShieldCheck },
  ONBOARDING: { label: "Onboarding", icon: UserPlus },
  RESEARCH: { label: "Research", icon: Search },
  PORTFOLIO: { label: "Portfolio", icon: ChartPie },
  SUPPORT: { label: "Support", icon: LifeBuoy },
  OTHER: { label: "Other", icon: HelpCircle },
} as const;

export function CategoryBadge({ category, className }: Props) {
  const c = CATEGORIES[category as keyof typeof CATEGORIES];
  if (!c) return null;
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center gap-1 rounded-full border border-hairline px-2 text-xs font-medium whitespace-nowrap text-body",
        className
      )}
    >
      <Icon className="size-3" aria-hidden />
      {c.label}
    </span>
  );
}
