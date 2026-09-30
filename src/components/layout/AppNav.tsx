"use client";

/**
 * src/components/layout/AppNav.tsx
 *
 * App navigation: one link list, rendered as the desktop sidebar and as a
 * mobile disclosure menu. The mobile menu is a native <details>, keyed by the
 * pathname so it remounts closed after each navigation (no open/close state).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/search", label: "Search" },
  { href: "/projects", label: "Projects" },
  { href: "/interviews", label: "Interviews" },
  { href: "/personas", label: "Personas" },
  { href: "/findings", label: "Findings" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/journey-maps", label: "Journey Maps" },
];

const AI_LINK = { href: "/ai/transcripts", label: "Transcript Analysis" };

function NavLinks({ showAi }: { showAi: boolean }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-0.5">
      {(showAi ? [...LINKS, AI_LINK] : LINKS).map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                active ? "bg-surface-card text-ink" : "text-muted-foreground hover:bg-surface-card/60 hover:text-ink"
              )}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Wordmark() {
  return (
    <Link
      href="/dashboard"
      className="rounded-md font-heading text-2xl leading-none tracking-tight text-ink outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      InvestorLens
    </Link>
  );
}

export function SidebarNav({ showAi }: { showAi: boolean }) {
  return (
    <nav aria-label="Main" className="flex-1 px-3 py-2">
      <NavLinks showAi={showAi} />
    </nav>
  );
}

export function MobileNav({ showAi }: { showAi: boolean }) {
  const pathname = usePathname();
  return (
    <details key={pathname} className="group relative">
      <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg text-ink outline-none hover:bg-surface-card focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
        <Menu className="size-5" aria-hidden />
        <span className="sr-only">Menu</span>
      </summary>
      <nav
        aria-label="Main"
        className="absolute right-0 z-40 mt-2 w-60 rounded-xl border border-border bg-background p-2 shadow-lg"
      >
        <NavLinks showAi={showAi} />
      </nav>
    </details>
  );
}
