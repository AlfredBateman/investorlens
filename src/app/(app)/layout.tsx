/**
 * src/app/(app)/layout.tsx  — App Shell Layout
 *
 * Wraps every feature page in the `(app)` route group (the group name is
 * omitted from the URL). Desktop gets a persistent sidebar; below `md` the
 * sidebar is replaced by a top bar with a disclosure menu, so navigation
 * exists at every width. Content is capped at DESIGN.md's ~1200px measure.
 */

import { connection } from "next/server";
import { MobileNav, SidebarNav, Wordmark } from "@/components/layout/AppNav";
import { aiEnabled } from "@/lib/flags";

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Every page here reads live data (better-sqlite3 queries finish during a build and would
  // otherwise be baked into static HTML) or the AI flag, so render per request.
  await connection();
  const showAi = aiEnabled();
  return (
    <div className="flex h-screen overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:ring-3 focus:ring-ring/50"
      >
        Skip to content
      </a>

      <aside
        id="app-sidebar"
        className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex print:hidden"
      >
        <div className="px-6 pt-6 pb-4">
          <Wordmark />
        </div>
        <SidebarNav showAi={showAi} />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 md:hidden print:hidden">
          <Wordmark />
          <MobileNav showAi={showAi} />
        </header>
        <main id="main-content" className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
