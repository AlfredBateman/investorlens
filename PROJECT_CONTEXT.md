# InvestorLens — Project Context

> Single-file orientation for someone (or an AI assistant) who has never seen this codebase.
> Every claim below was taken from the source as of **2026-09-30**. Where something could not be confirmed from the code, it is marked **Unclear**. No secrets appear in this file.
>
> Reading order of the other docs in the repo: `README.md` (feature tour), `PRD.md` (product intent), `RUN_INSTRUCTIONS.txt` (setup), `DESIGN.md` (visual system), `AGENTS.md`/`CLAUDE.md` (agent rules), `AUDIT.md` (**stale**, see [§11.4](#114-auditmd-reconciliation)).

---

## Table of contents

1. [Project summary](#1-project-summary)
2. [Tech stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Directory structure](#4-directory-structure)
5. [Features and functionality](#5-features-and-functionality)
6. [Data](#6-data)
7. [APIs and endpoints](#7-apis-and-endpoints)
8. [External integrations](#8-external-integrations)
9. [Configuration](#9-configuration)
10. [Setup and running](#10-setup-and-running)
11. [Current status](#11-current-status)
12. [Suggested improvements](#12-suggested-improvements)
13. [How to extend](#13-how-to-extend)

---

## 1. Project summary

**InvestorLens** is a local-first, single-user **UX research management app**. A researcher keeps everything from one research study in one place, linked together:

```
Project
  └─ Interviews ──► Findings ──► Recommendations
        │              │
        └──► Personas  └──► Journey-map stages (also link to Personas)
  Dashboard · Search · URL-based filters · Printable report · optional AI transcript analysis
```

- **Who it is for:** one researcher (or a few people sharing one machine/database) running a research project. There is **no authentication, no multi-user handling, no cloud deployment** (by design, see `PRD.md` "Out of Scope").
- **Problem it solves:** interview notes, pain points, personas, journey maps and recommendations normally live in separate docs/spreadsheets/decks with nothing tying them together. InvestorLens stores them as linked records so "which recommendations came out of the KYC complaints?" is answerable in the UI.
- **Sample data:** the bundled seed is a fictional retail-investor study (14 participants across Zerodha / Groww / Upstox / Angel One, Jan–Feb 2025). The app itself is domain-generic; only the `InvestingPlatform` enum, the `FindingCategory` values (KYC, Onboarding, Research, Portfolio, Support, Other) and the AI prompt wording are investing-specific.
- **Optional AI feature:** `/ai/transcripts` sends a pasted/uploaded transcript to Google's Gemini API and returns *suggested* findings that a human approves or rejects before anything is saved. Off by default.

---

## 2. Tech stack

Versions are the *installed* versions in `node_modules` (declared ranges are in `package.json`).

| Layer | Choice | Version (installed) | Where |
|---|---|---|---|
| Runtime | Node.js | v22.22.2 on the dev machine; `RUN_INSTRUCTIONS.txt` says ≥ 20.9 | — |
| Framework | Next.js (App Router, Server Components, Server Actions, Turbopack) | 16.2.9 (pinned) | `next.config.ts` |
| UI library | React | 19.2.4 (pinned) | — |
| Language | TypeScript (strict) | ^5 | `tsconfig.json` (path alias `@/*` → `src/*`) |
| Styling | Tailwind CSS v4 via `@tailwindcss/postcss`, `tw-animate-css`, `shadcn/tailwind.css` | 4.3.0 | `src/app/globals.css`, `postcss.config.mjs` |
| Component primitives | `@base-ui/react` (Dialog, Toast) wrapped shadcn-style (`components.json` style `base-nova`), `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` icons | base-ui 1.5.0 | `src/components/ui/` |
| Charts | Recharts | 3.8.1 | `src/components/features/dashboard/` |
| Validation | Zod (shared by client-visible schemas and server actions) | 4.4.3 | `src/lib/validations/` |
| Database | SQLite, single file `prisma/dev.db` | — | — |
| ORM | Prisma Client + `@prisma/adapter-better-sqlite3` driver adapter; native module `better-sqlite3` | `@prisma/client` 7.8.0, CLI `prisma` 7.10.0 installed (see [§12](#12-suggested-improvements)) | `prisma/schema.prisma`, `src/lib/db.ts` |
| Fonts | `next/font/google`: Inter (`--font-sans`) and Cormorant Garamond 500 (`--font-display`, used as `font-heading`) | — | `src/app/layout.tsx` |
| AI (optional) | Google Gemini over plain `fetch` (no SDK) | model default `gemini-3.8-flash` | `src/server/ai/gemini.ts` |
| Lint | ESLint 9 + `eslint-config-next` 16.2.9 (core-web-vitals + typescript) | — | `eslint.config.mjs` |
| TS runner | `tsx` (seed script and AI self-check) | ^4.22.4 | — |

Not present: test framework, CI config, Dockerfile, auth library, REST/GraphQL API layer, background job system, cache layer, PDF library (the report uses the browser's print dialog).

---

## 3. Architecture

A single Next.js process. Reads happen in React Server Components straight against Prisma; writes happen in Server Actions. There is **no `/api` route handler** in the project.

```
Browser
  │  (HTML/RSC stream, form POSTs to Server Actions)
  ▼
Next.js 16 server (one Node process)
  ├─ src/app/**/page.tsx            Server Components: await searchParams/params → call src/server/queries/*
  ├─ src/server/queries/*.ts        Read-only Prisma queries (React cache() on *ById)
  ├─ src/server/actions/*.ts        "use server" mutations: FormData → Zod → Prisma → revalidatePath → redirect
  ├─ src/server/ai/*.ts             Gemini client + prompt/validation (only used by actions/ai.ts)
  ├─ src/lib/db.ts                  Prisma singleton (globalThis cache) with better-sqlite3 adapter
  └─ Client Components ("use client"): forms (useActionState), FilterBar/ProjectSelector (URL state),
        delete dialogs, Recharts charts, AppNav, TranscriptExtractor, toast
          │
          ▼
   prisma/dev.db  (SQLite file, relative to process.cwd())           ──► (optional) generativelanguage.googleapis.com
```

Key architectural decisions visible in code:

- **Project scoping via URL.** Almost every page is scoped by `?projectId=<uuid>` (chosen through `ProjectSelector`). Without a project, list pages show a "No project selected" empty state. The dashboard is the one exception (works cross-project).
- **All state lives in the URL or the DB.** Filters, search text and selected project are search params (`useFilterParams`); there is no client store.
- **Everything under `(app)` renders per request.** `src/app/(app)/layout.tsx` calls `await connection()` (from `next/server`) so SQLite reads are never baked in at build time. `next build` output confirms all `(app)` pages and `/report/[projectId]` are `ƒ (Dynamic)`; only `/` and `/_not-found` are static.
- **Mutations return `ActionResult`** (`src/server/actions/types.ts`): `{ error?: Record<field,string[]>, message?: string, success?: boolean }`. Field errors render inline; `message` is toasted by `useActionToast`. Successful create/delete actions `redirect()`; successful updates return `{ success: true }`.
- **Delete actions `redirect()` on success and *return* `{message}` on failure** (not throw) because production builds strip messages from thrown server-action errors (comment in `src/hooks/use-delete-action.ts`).
- **Report page lives outside `(app)`** (`src/app/report/[projectId]/page.tsx`) so it has no sidebar; print CSS is in `globals.css` (`@page` margin 16mm, `print-color-adjust: exact`).
- **No background jobs, queues, cron, caching layer or websockets.**

Next.js 16 specifics used (AGENTS.md warns this is not the Next you may remember; docs are in `node_modules/next/dist/docs/`): `params` and `searchParams` are **Promises** and are awaited everywhere; `connection()` from `next/server`; `unstable_rethrow` from `next/navigation`; `serverExternalPackages: ["better-sqlite3"]` in `next.config.ts`; no `middleware`/`proxy` file exists.

---

## 4. Directory structure

```
InvestorLens/
├─ CLAUDE.md                 One line: "@AGENTS.md" (imports agent rules)
├─ AGENTS.md                 "This is NOT the Next.js you know" — read node_modules/next/dist/docs/ before writing Next code
├─ README.md                 User-facing overview (accurate against current code)
├─ PRD.md                    Product requirements; "Built and working" status
├─ RUN_INSTRUCTIONS.txt      Step-by-step setup + troubleshooting
├─ DESIGN.md                 Design tokens/rules (warm cream canvas + coral, serif display headings). UI work must follow it
├─ AUDIT.md                  README-vs-code audit dated 2026-09-23 — STALE, describes an earlier state of the code
├─ PROJECT_CONTEXT.md        This file
├─ package.json / package-lock.json
├─ next.config.ts            serverExternalPackages: ["better-sqlite3"]
├─ prisma.config.ts          Prisma 7 config: schema path, datasource url "file:./prisma/dev.db", migrations.seed = "npx tsx prisma/seed.ts"
├─ tsconfig.json, eslint.config.mjs, postcss.config.mjs, components.json (shadcn)
├─ .env / .env.example       Env files (.env is git-ignored; see §9). NOTE .gitignore pattern ".env*" also ignores .env.example
├─ prisma/
│  ├─ schema.prisma          7 enums, 8 models (see §6)
│  ├─ migrations/            20260923101256_init, 20260923103402_journey_stage_links, migration_lock.toml
│  ├─ seed.ts                Wipes all projects then loads the demo study (see §5.12)
│  └─ dev.db                 The SQLite database (git-ignored). Currently holds the seeded demo data
├─ public/                   Empty
└─ src/
   ├─ app/
   │  ├─ layout.tsx          Root layout: fonts, <Toaster/>, site metadata
   │  ├─ page.tsx            redirect("/dashboard")
   │  ├─ error.tsx           Root error boundary
   │  ├─ globals.css         Tailwind v4 theme + DESIGN.md tokens + print rules
   │  ├─ (app)/              Route group with the sidebar shell (layout.tsx, loading.tsx, error.tsx)
   │  │  ├─ dashboard/       page.tsx, loading.tsx
   │  │  ├─ search/          page.tsx
   │  │  ├─ projects/        page.tsx, new/, [id]/ (page, edit/, not-found)
   │  │  ├─ interviews/      page.tsx, new/, [id]/ (page, edit/, not-found)
   │  │  ├─ personas/        same shape
   │  │  ├─ findings/        same shape
   │  │  ├─ recommendations/ same shape
   │  │  ├─ journey-maps/    same shape
   │  │  └─ ai/transcripts/  page.tsx (feature-flagged)
   │  └─ report/[projectId]/page.tsx   Printable report, outside the app shell
   ├─ components/
   │  ├─ layout/AppNav.tsx   Wordmark, SidebarNav, MobileNav (native <details>), link list, optional AI link
   │  ├─ ui/                 badge, button, dialog (base-ui), input, label, separator, textarea, toast (base-ui), level-badge
   │  └─ features/
   │     ├─ ai/TranscriptExtractor.tsx       Upload/paste form + review UI (client)
   │     ├─ dashboard/       RampBarChart, FindingsBarChart, FindingsTrendChart (Recharts, client)
   │     ├─ findings|interviews|personas|recommendations|journey-maps|projects/   Card, Form, DeleteXButton, badges, JourneyStepper, ProjectSelector, ProjectStatCard
   │     ├─ report/PrintButton.tsx           window.print()
   │     └─ shared/FilterBar.tsx             Declarative filter bar (search + pills + range + select)
   ├─ hooks/                 use-action-toast, use-delete-action, use-filter-params
   ├─ lib/
   │  ├─ db.ts               Prisma singleton
   │  ├─ flags.ts            aiEnabled() = process.env.AI_FEATURES === "on"
   │  ├─ friction.ts         Friction scale constants (FRICTION_MAX=5, HIGH_FRICTION=4), labels, fills
   │  ├─ platform-labels.ts  InvestingPlatform → display label
   │  ├─ tones.ts            ORDINAL_RAMP colors + step/label maps for severity, priority, status
   │  ├─ utils.ts            cn(), formatDate(), truncate()
   │  └─ validations/        Zod schemas: project, interview, persona, finding, recommendation, journeyMap
   ├─ server/
   │  ├─ actions/            project, interview, persona, finding, recommendation, journeyMap, ai, types
   │  ├─ queries/            project, interview, persona, finding, recommendation, journeyMap, dashboard, search
   │  └─ ai/                 gemini.ts (client), transcript.ts (prompt/schema/validation), transcript.check.ts (self-check script)
   └─ types/index.ts         Re-exports Prisma model/enum types + ProjectWithCounts
```

---

## 5. Features and functionality

### 5.0 Cross-cutting behavior (applies to most features)

**Project selection.** `ProjectSelector` (`src/components/features/projects/ProjectSelector.tsx`) is a native `<select>`; on change it `router.push`es `<basePath>?projectId=<id>` plus any params named in `preserveParams`. Each page lists which params survive a project switch (e.g. findings keep `category,severity,q` but drop `personaId` because personas are project-scoped).

**Filter bar.** `FilterBar` (`features/shared/FilterBar.tsx`) takes `searchParam?` and `controls[]` of type `pills | select | range`. All controls call `useFilterParams().setParam/clearParams`, which clone the current `URLSearchParams`, so every filter lives in the URL (shareable links). The search box debounces 350 ms and is remounted (`key={currentSearch}`) when the URL value changes externally (e.g. "Clear Filters"). Range inputs commit on blur. Pages validate enum filter values against `Object.values(Enum)` and silently ignore invalid ones.

**Forms.** Every entity form is a client component using `useActionState(create|update action)`; the presence of the entity prop switches create/edit. Hidden inputs carry `id` and `projectId`. `noValidate` is set, so all validation is Zod on the server; field errors (`state.error.<field>[0]`) render inline with `aria-invalid`/`aria-describedby`; general messages toast through `useActionToast`.

**Delete.** Each entity has a `DeleteXButton` (base-ui Dialog confirmation) built on `useDeleteAction(action, fallbackMessage)`. Success = server `redirect()`; failure = toast.

**Empty / loading / error / not-found states.** `(app)/loading.tsx` and `dashboard/loading.tsx` skeletons; `(app)/error.tsx` and `app/error.tsx` boundaries with "Try Again"; each `[id]` folder has a `not-found.tsx`, triggered by `notFound()` when the query returns null.

**Severity/priority/status visuals.** One coral ordinal ramp (`ORDINAL_RAMP` in `lib/tones.ts`, hex because Recharts needs hex) drives `LevelBadge` dots, recommendation board column top borders and `RampBarChart` bars, so a level looks the same everywhere. Category is deliberately neutral (icon + label in `CategoryBadge`).

### 5.1 Projects

- **What:** top-level container (name ≤100, optional description ≤500, status ACTIVE/COMPLETED/ARCHIVED). Deleting a project cascades to everything under it.
- **Files:** pages `src/app/(app)/projects/{page,new/page,[id]/page,[id]/edit/page,[id]/not-found}.tsx`; components `ProjectCard`, `ProjectForm`, `DeleteProjectButton`, `ProjectStatCard`; actions `createProject`, `updateProject`, `deleteProject` in `src/server/actions/project.ts`; queries `getAllProjects`, `getProjectById` (both include `_count` of interviews, findings, personas, recommendations, journeyMaps); schemas `createProjectSchema`, `updateProjectSchema`.
- **Flow:** list → card → detail page (counts, quick links to each section, "Export report" → `/report/<id>`, Edit, Delete). Create redirects to `/projects/<id>`; update returns success toast; delete redirects to `/projects`.
- **Edge cases / limits:** `ProjectForm` sends the current `status` as a hidden input and offers no status control, so **status cannot be changed from the UI** (the Archived badge path in cards/detail is only reachable via DB edits). `updateProjectSchema.status` is optional but `formData.get("status")` returns `null` when absent, which `z.enum().optional()` rejects (not reachable from the UI because the hidden field is always sent). `DeleteProjectButton` copy lists "interviews, findings, personas, and recommendations" (omits journey maps, which are also deleted).

### 5.2 Interviews

- **What:** one record per participant: name (≤150), age (int 18–100), platform (`InvestingPlatform`), optional occupation (`candidateRole` ≤100) and employer (`candidateCompany` ≤150), optional investing behavior / goals / frustrations (≤2000 each), date conducted, and free-text `notesText` (required, no max).
- **Files:** `src/app/(app)/interviews/**`; `InterviewCard`, `InterviewForm`, `DeleteInterviewButton`; actions `createInterview`, `updateInterview`, `deleteInterview` (`actions/interview.ts`); queries `getInterviewsByProject(projectId, {platform, ageMin, ageMax, search})`, `getInterviewById` (cached; includes project and findings); schema `lib/validations/interview.ts`.
- **Flow:** list page filters: platform pills, age range (min/max), free-text `q` over name/role/company/notes (`contains`, i.e. SQLite `LIKE`). The list query uses `LIST_SELECT` and **never loads `notesText`** (only the detail page does). Detail page shows context, the three optional text blocks, session notes (`whitespace-pre-wrap`), and the findings sourced from this interview. Date input uses `<input type="date">`; `z.coerce.date` parses `YYYY-MM-DD` as UTC midnight and the form re-renders it with `toISOString().slice(0,10)`.
- **Edge cases / limits:** deleting an interview sets `Finding.interviewId` to null (`onDelete: SetNull`) and removes its `PersonaInterview` rows. **Bug (read from code, not runtime-tested):** `updateInterview` maps empty optional fields to `undefined` (`formData.get(x) || undefined`), and Prisma `update` ignores `undefined`, so **clearing an optional field (occupation, employer, behavior, goals, frustrations) on edit does not clear it in the DB**. Contrast with persona/finding/journey-map updates, which map empty → `null`. No pagination.

### 5.3 Personas

- **What:** synthesized user type: name (≤100), role (≤100, required), optional age range (free text ≤50, e.g. "25-34"), optional occupation, optional avatar URL (validated as URL, rendered with a plain `<img>`), goals and frustrations (required text), plus a many-to-many link to the interviews it was derived from.
- **Files:** `src/app/(app)/personas/**`; `PersonaCard`, `PersonaForm` (interview checkboxes), `DeletePersonaButton`; actions in `actions/persona.ts`; queries `getPersonasByProject(projectId, search)` (search over name/role/occupation/goals/frustrations; includes `_count.interviews`), `getPersonaById` (cached; includes project and linked interviews).
- **Flow:** on update the action runs `db.$transaction([personaInterview.deleteMany, persona.update({... interviews.create})])`, replacing the link set atomically. Empty optional fields are stored as `null`.
- **Edge cases / limits:** `interviewIds` are **not checked to belong to the persona's project** (a crafted POST could link another project's interview). `projectId` on update is taken from the hidden form field, not re-read from the DB.

### 5.4 Findings

- **What:** recurring pain point: title (≤200), description (≤10,000), category (`KYC|ONBOARDING|RESEARCH|PORTFOLIO|SUPPORT|OTHER`, default OTHER), severity (`LOW|MEDIUM|HIGH|CRITICAL`, default MEDIUM), optional single source interview.
- **Files:** `src/app/(app)/findings/**`; `FindingCard`, `FindingForm`, `DeleteFindingButton`, `SeverityBadge`, `CategoryBadge`; actions in `actions/finding.ts`; queries `getFindingsByProject(projectId, {category, severity, personaId, search})`, `getFindingById` (cached; includes project, interview, recommendations).
- **Flow:** list sorted **most severe first, newest first within a severity** — SQL orders by `createdAt desc`, then JS stable-sorts by `SEVERITY_RANK` (enum declaration order) because SQLite would sort the enum text alphabetically. The persona filter means "findings whose *source interview* is linked to this persona" (`interview: { personas: { some: { personaId } } }`); findings with no interview never match it. Detail page shows linked recommendations and source interview.
- **Known bugs on the detail page** (`findings/[id]/page.tsx`): "Create first recommendation" links to `/recommendations/new?findingId=<id>` **without `projectId`**, and `recommendations/new/page.tsx` immediately `redirect`s to `/recommendations` when `projectId` is missing. "View in board" links to `/recommendations?findingId=<id>`, but that page ignores `findingId` and needs `projectId`. Both links therefore do not do what they say (fix: append `&projectId=${finding.projectId}` to the first; drop or implement `findingId` on the board).
- **Edge cases:** `interviewId` is not checked to belong to the finding's project. Deleting a finding cascades to its recommendations and removes journey-stage links.

### 5.5 Recommendations

- **What:** proposed fix tied to exactly one finding: title (≤200), description (≤10,000), priority (`LOW|MEDIUM|HIGH`, default MEDIUM), status (`PROPOSED→APPROVED→IN_PROGRESS→COMPLETED`, default PROPOSED).
- **Files:** `src/app/(app)/recommendations/**`; `RecommendationCard`, `RecommendationForm`, `DeleteRecommendationButton`, `PriorityBadge`, `StatusBadge`; actions in `actions/recommendation.ts`; queries `getRecommendationsByProject(projectId, {priority, status, search})`, `getRecommendationById`.
- **Flow:** the list page is a four-column **Kanban-style board** (one column per status, columns' top border colors step along the ramp). It is display-only: **there is no drag-and-drop or inline status change**; status changes go through the edit form. `createRecommendation` looks up the finding and **derives `projectId` from it** (never from the form); on create it redirects to `/recommendations?projectId=…`. `updateRecommendation` strips `findingId` (fixed after creation; the edit form shows the select disabled with a hidden input). `RecommendationForm` accepts `defaultFindingId` (from `?findingId=`) and locks the select when present.
- **Edge cases:** `updateRecommendation` only revalidates `/recommendations`; the `deleteRecommendation` `projectId` argument is used only for the redirect.

### 5.6 Journey maps

- **What:** an ordered list of stages. Map: title (≤200), optional description (≤2000). Stage: name (≤100), optional description (≤2000), optional `painType` (`CONFUSION|FRICTION|DELAY|UNCERTAINTY|OTHER`), `frictionRating` int 0–5, linked findings (≤50) and linked personas (≤50). 1–20 stages per map. Stages rated ≥ `HIGH_FRICTION` (4) are visually flagged.
- **Files:** `src/app/(app)/journey-maps/**`; `JourneyMapCard` (mini friction bar strip), `JourneyMapForm` (dynamic stage editor), `JourneyStepper` (horizontal stepper on the detail page), `DeleteJourneyMapButton`; `lib/friction.ts`; actions in `actions/journeyMap.ts`; queries `getJourneyMapsByProject`, `getJourneyMapById` (cached; stages ordered by `position`, with linked findings/personas); schema `lib/validations/journeyMap.ts`.
- **Flow:** the form keeps stages in client state (add, remove, move up/down, toggle pill checkboxes for findings/personas) and serializes them to one hidden field `stagesJson`. The action (`parseStages` → Zod → `linksBelongToProject`) verifies **every linked finding and persona belongs to the map's project** and returns `INVALID_LINKS` otherwise. Create writes the map and nested stages (`position` = array index) in one `create`. Update runs a transaction: delete all existing stages (their M2M rows go with them), then update the map and recreate stages in order. The update action **reads `projectId` from the DB**, not the form. Detail page shows a summary sentence ("N of M stages are high friction: …"), a legend, and the stepper.
- **Edge cases:** editing recreates stage rows (new ids each save). The "visual editor" is list-based (no drag-and-drop canvas); the README lists a canvas as future work.

### 5.7 Dashboard

- **Route / file:** `/dashboard` — `src/app/(app)/dashboard/page.tsx`; data from `getDashboardData(filters)` in `src/server/queries/dashboard.ts`.
- **Inputs (search params):** `projectId`, `category`, `severity`, `personaId`, `priority`. With no valid `projectId` the numbers are cross-project totals; with one, everything is scoped and the `FilterBar` (category, severity, persona select, recommendation priority) appears. Invalid values are ignored.
- **Outputs:** five stat cards (Projects, Interviews, Personas, Findings, Recommendations — each links to its list, carrying `projectId`), then five charts, rendered only if `totalFindings > 0 || totalRecommendations > 0`:
  1. Findings by severity — `RampBarChart`, enum order Low→Critical, zero-filled.
  2. Findings by category — `FindingsBarChart`, sorted descending by count.
  3. Recommendations by status — `RampBarChart`, pipeline order, filtered by `priority`.
  4. Findings by platform — `FindingsBarChart`, sorted descending; counts findings by their **source interview's platform**.
  5. Findings over time — `FindingsTrendChart` (line), weekly buckets (Monday-start, UTC) by the source interview's `dateConducted`, zero-filled between first and last week.
- **How:** one `Promise.all` of `count`/`groupBy`/`findMany` queries; `orderByEnum()` re-orders `groupBy` output against `Object.values(Enum)` (Prisma would sort the string-backed enum alphabetically) and zero-fills. The persona filter applies to finding-derived numbers only (severity, category, platform, trend, and the findings count), not to recommendations.
- **Limits:** platform and trend charts **exclude findings with no linked interview**; an empty state "Get started" appears only when there are no projects.

### 5.8 Search

- **Route / file:** `/search` — `src/app/(app)/search/page.tsx`; `searchProject(projectId, query)` in `src/server/queries/search.ts`.
- **What:** one box that searches interviews (name, role, company, notes), findings (title, description), personas (name, role, occupation, goals, frustrations) and recommendations (title, description) within the selected project; up to 20 results per entity type (`TAKE = 20`), newest first (interviews by date). Results are grouped sections with badges and links to detail pages. Requires a project and a non-empty query.
- **Limits:** substring match via Prisma `contains` (SQLite `LIKE`); no ranking, highlighting or pagination. **Unclear:** behavior for non-ASCII case-insensitivity (depends on SQLite `LIKE` semantics).

### 5.9 Filters (per list page)

| Page | URL params | Applied in |
|---|---|---|
| `/findings` | `projectId, category, severity, personaId, q` | `getFindingsByProject` |
| `/interviews` | `projectId, platform, ageMin, ageMax, q` | `getInterviewsByProject` |
| `/recommendations` | `projectId, priority, status, q` | `getRecommendationsByProject` |
| `/personas` | `projectId, q` | `getPersonasByProject` |
| `/dashboard` | `projectId, category, severity, personaId, priority` | `getDashboardData` |
| `/search` | `projectId, q` | `searchProject` |
| `/journey-maps`, `/ai/transcripts` | `projectId` | — |

### 5.10 Report export

- **Route / file:** `/report/[projectId]` — `src/app/report/[projectId]/page.tsx`; `PrintButton` calls `window.print()`. Unknown project → `notFound()`.
- **Sections (numbered in the page):** 1 Executive summary (four KPI tiles + sentences auto-generated from data: age range, interview date span, severity breakdown, "most affected area" / "spread evenly", platform leader, highest-friction stages, recommendation status breakdown); 2 Participant overview (platform counts + table); 3 Findings; 4 Personas; 5 Journey maps (stages with friction and pain type); 6 Recommendations grouped by status; 7 Charts (the same five as the dashboard, from `getDashboardData({ projectId })`).
- **How:** a single `Promise.all` over the project's queries; helper functions `joinList`, `plural`, `leaders`, `leadSentence`, `breakdown` build the prose. Layout: 680px column on screen, `print:max-w-none`; toolbar is `print:hidden`; blocks use `break-inside-avoid`.
- **Limits:** PDF quality depends on the browser's print engine; no server-side PDF; no per-section toggles.

### 5.11 AI transcript analysis (opt-in)

- **Gate:** `aiEnabled()` (`AI_FEATURES === "on"`). When off: `/ai/transcripts` calls `notFound()`, the nav link is not rendered, and both AI actions return a "disabled" message. When on but `GEMINI_API_KEY` is missing the page shows a setup notice instead of the form (`geminiConfigured()`).
- **Step 1 — extract** (`extractSuggestions` in `src/server/actions/ai.ts`, writes nothing): input `projectId`, optional `interviewId` (must belong to the project), `transcript` (trimmed, 50–60,000 chars). It loads the project's findings (id/title/description), builds the prompt with `buildPrompt`, calls `generateJson(prompt, PAIN_POINT_SCHEMA)` and converts the reply with `toSuggestions`. Returns `{ suggestions, runId }` (`runId` is a fresh UUID so the review UI remounts) or `{ message }` on failure (shown inline, not as a toast).
- **Untrusted-output safeguards** (`src/server/ai/transcript.ts`): reply Zod-validated (`modelOutputSchema`); suggestions with empty quote/summary dropped; capped at `MAX_SUGGESTIONS = 15`; a `matchedFindingId` not in the project's finding set becomes `null` (= "new finding"); blank title falls back to the first 120 chars of the summary; each quote is checked against the whitespace/case-normalized transcript and flagged `verbatim: false` if absent; the prompt tells the model to treat the transcript as data and ignore instructions in it.
- **Step 2 — review** (`SuggestionReview` inside `TranscriptExtractor.tsx`): per suggestion the user chooses approve/reject; for "new" suggestions title, category and severity are editable before approving; unverbatim quotes show a warning. The "Save N approved" button is disabled at 0 approvals.
- **Step 3 — apply** (`applySuggestions`): decisions arrive as JSON (`decisionsJson`, only approved ones: `{kind:"match", findingId, quote}` or `{kind:"new", title, description, category, severity}`), are Zod-validated (1–50), and every `findingId`/`interviewId` is re-verified against the project. Matches append `\n\nSupporting quote (<candidateName>): "<quote>"` to the finding's description (the interview name appears only if an interview was selected); several quotes for one finding accumulate. New ones are created with the selected `interviewId`. All writes run in one `db.$transaction`, then it redirects to `/findings?projectId=…`.
- **Client details:** upload accepts `.txt/.md` up to 200,000 bytes (`MAX_FILE_BYTES`), read in the browser with `File.text()`; the server limit is 60,000 *characters*, so a large-but-allowed file can still be rejected server-side with the inline error. The interview select is live state, so changing it after extraction changes which interview the approved suggestions are linked to. `CATEGORY_OPTIONS` in `TranscriptExtractor.tsx` is a hard-coded copy of the `FindingCategory` values.
- **Self-check:** `npx tsx src/server/ai/transcript.check.ts` (assertions on envelope parsing, verbatim flag, id downgrading, caps, error extraction, missing key). It is not wired into `package.json` scripts. It passed when run on 2026-09-30.
- **Limits (by design, per README/PRD):** one transcript at a time; findings only (no persona/journey suggestions); no cross-transcript clustering; quotes are appended to description text (a `ponytail:` comment in `actions/ai.ts` notes a `FindingEvidence` table as the upgrade path).

### 5.12 Seed data

`prisma/seed.ts` (run by `npx prisma db seed`): first `project.deleteMany()` (cascades, **wipes everything**), then creates one project "Retail Investor UX Research — Zerodha vs Groww", 14 interviews (Groww 5, Zerodha 4, Upstox 3, Angel One 2; 2025-01-08 → 2025-02-21), 3 personas (New Investor, Active Trader, Passive SIP Investor) linked to interviews, 5 findings (one per category, severities Critical/High/High/Medium/Low), 8 recommendations (spread across all four statuses), and one 7-stage journey map ("First investment journey": Discover Platform, Sign Up, KYC, Fund Account, Research Investment, Place Investment, Track Portfolio; KYC=5, Fund Account=4, Place Investment=4 are high friction). Participants are fictional. The current `prisma/dev.db` contents match this.

### 5.13 Navigation, shell and UI kit

`(app)/layout.tsx`: desktop sidebar (`w-60`, hidden `<md`), mobile top bar with a `<details>` menu that remounts (keyed by pathname) to close after navigation, skip-to-content link, content capped at `max-w-6xl`. Nav links: Dashboard, Search, Projects, Interviews, Personas, Findings, Recommendations, Journey Maps, plus "Transcript Analysis" when AI is on (`AppNav.tsx`). `/report` has no nav. Toasts: `toast.success/error` (base-ui toast manager, mounted once as `<Toaster/>` in the root layout). No dark-mode toggle exists (a `.dark` token block from shadcn defaults exists in `globals.css` but nothing applies the class).

---

## 6. Data

### 6.1 Schema (`prisma/schema.prisma`)

Datasource `sqlite`; generator `prisma-client-js`. Enums are real Prisma enums (stored as TEXT in SQLite). IDs are UUID strings (`@default(uuid())`). All models have `createdAt`/`updatedAt`.

| Enum | Values |
|---|---|
| `ProjectStatus` | ACTIVE, COMPLETED, ARCHIVED |
| `InvestingPlatform` | ZERODHA, GROWW, UPSTOX, ANGEL_ONE, OTHER |
| `FindingCategory` | KYC, ONBOARDING, RESEARCH, PORTFOLIO, SUPPORT, OTHER |
| `SeverityLevel` | LOW, MEDIUM, HIGH, CRITICAL |
| `RecommendationStatus` | PROPOSED, APPROVED, IN_PROGRESS, COMPLETED |
| `RecommendationPriority` | LOW, MEDIUM, HIGH |
| `PainPointType` | CONFUSION, FRICTION, DELAY, UNCERTAINTY, OTHER |

| Table (model) | Key fields | Relations / delete behavior | Indexes |
|---|---|---|---|
| `projects` (Project) | name, description?, status=ACTIVE | parent of all below; all children `onDelete: Cascade` | — |
| `interviews` (Interview) | projectId, candidateName, candidateRole?, candidateCompany?, age Int, platform, investingBehavior?, goals?, frustrations?, notesText, dateConducted | → Project (cascade); ← Finding[], ← PersonaInterview[] | (projectId, dateConducted) |
| `personas` (Persona) | projectId, name, role, avatarUrl?, ageRange?, occupation?, goals, frustrations | → Project (cascade); ← PersonaInterview[]; M2M JourneyStage | (projectId) |
| `persona_interviews` (PersonaInterview) | personaId, interviewId | join table, composite PK; both FKs cascade | (interviewId) |
| `findings` (Finding) | projectId, interviewId?, title, description, category=OTHER, severity=MEDIUM | → Project (cascade); → Interview (**SetNull**); ← Recommendation[]; M2M JourneyStage | (projectId,category), (projectId,severity), (interviewId) |
| `recommendations` (Recommendation) | projectId, findingId, title, description, status=PROPOSED, priority=MEDIUM | → Project (cascade); → Finding (cascade). `projectId` is always copied from the finding by the action | (projectId,status), (findingId) |
| `journey_maps` (JourneyMap) | projectId, title, description? | → Project (cascade); ← JourneyStage[] | (projectId) |
| `journey_stages` (JourneyStage) | journeyMapId, position Int, name, description?, painType?, frictionRating Int=0 | → JourneyMap (cascade); implicit M2M with Finding (`_FindingToJourneyStage`) and Persona (`_JourneyStageToPersona`) | unique (journeyMapId, position) |

Constraints not enforced by the database (only by Zod): frictionRating 0–5, age ≥ 18, string lengths, "linked entities belong to the same project" (enforced in `journeyMap` and `ai` actions only).

Migrations: `20260923101256_init` (full schema) and `20260923103402_journey_stage_links` (drops `journey_maps.personaId` and `journey_stages.findingId`; adds the two implicit M2M tables). The local DB has both applied. `migration_lock.toml` is present.

### 6.2 Data sources

- User input through forms (the only ongoing source).
- `prisma/seed.ts` (demo data).
- Optional: Gemini-generated suggestions, which only become data after human approval.
- No imports, no scheduled ingestion, no third-party data feeds.

### 6.3 Data flow

```
Form (client) ──FormData──► Server Action ──Zod──► Prisma ──► SQLite
                                     │
                                     └─ revalidatePath(...) + redirect()/return ActionResult

Page request ─► Server Component ─► queries/*.ts ─► Prisma ─► SQLite ─► props ─► (client charts/forms)
```

Derived/aggregated data (dashboard stats, report summary sentences, weekly buckets) is computed on every request in TypeScript/Prisma; nothing is materialized or cached.

---

## 7. APIs and endpoints

### 7.1 HTTP routes

There are **no custom API route handlers** (`route.ts`) — only page routes and the `/favicon.ico` metadata file. Server Actions are invoked by Next's own POST mechanism, not a documented API.

**Auth:** none anywhere. No session, token, role check or rate limit. Anyone who can reach the server can read and mutate all data, including by POSTing to the Server Actions.

### 7.2 Page routes

| Route | File | Notes |
|---|---|---|
| `/` | `src/app/page.tsx` | `redirect("/dashboard")` |
| `/dashboard` | `(app)/dashboard/page.tsx` | optional `projectId` + filters |
| `/search` | `(app)/search/page.tsx` | `projectId`, `q` |
| `/projects`, `/projects/new`, `/projects/[id]`, `/projects/[id]/edit` | `(app)/projects/**` | |
| `/interviews`, `/interviews/new?projectId=`, `/interviews/[id]`, `/interviews/[id]/edit` | `(app)/interviews/**` | `new` redirects to `/interviews` if no `projectId` |
| `/personas`, `/personas/new?projectId=`, `/personas/[id]`, `/personas/[id]/edit` | `(app)/personas/**` | same |
| `/findings`, `/findings/new?projectId=`, `/findings/[id]`, `/findings/[id]/edit` | `(app)/findings/**` | same |
| `/recommendations`, `/recommendations/new?projectId=&findingId=`, `/recommendations/[id]`, `/recommendations/[id]/edit` | `(app)/recommendations/**` | same; `findingId` preselects and locks the finding |
| `/journey-maps`, `/journey-maps/new?projectId=`, `/journey-maps/[id]`, `/journey-maps/[id]/edit` | `(app)/journey-maps/**` | same |
| `/ai/transcripts` | `(app)/ai/transcripts/page.tsx` | 404 unless `AI_FEATURES=on` |
| `/report/[projectId]` | `report/[projectId]/page.tsx` | outside the app shell |

### 7.3 Server Actions (the write API)

All are `"use server"` functions. Form actions have the signature `(prev: ActionResult | null, formData: FormData) => Promise<ActionResult>`; delete actions are `(id, projectId) => Promise<ActionResult>` (`deleteProject(id)` takes only the id). Input is parsed from FormData, validated with Zod, and errors come back as `{ error: fieldErrors }` (validation) or `{ message }` (DB failure / not found).

| Action (file) | Inputs (FormData fields) | Effect | Revalidates | On success |
|---|---|---|---|---|
| `createProject` (`project.ts`) | name, description | create | `/projects` | redirect `/projects/<id>` |
| `updateProject` | id, name, description, status | update | `/projects`, `/projects/<id>` | `{success}` |
| `deleteProject(id)` | — | delete (cascade) | `/projects` | redirect `/projects` |
| `createInterview` (`interview.ts`) | projectId, candidateName, candidateRole, candidateCompany, age, platform, investingBehavior, goals, frustrations, dateConducted, notesText | create | `/projects/<pid>`, `/interviews` | redirect `/interviews/<id>` |
| `updateInterview` | same + id | update | `/interviews/<id>`, project, `/interviews` | `{success}` |
| `deleteInterview(id, pid)` | — | delete | project, `/interviews` | redirect `/interviews?projectId=` |
| `createPersona` (`persona.ts`) | projectId, name, role, avatarUrl, ageRange, occupation, goals, frustrations, interviewIds[] | create + junction rows | project, `/personas` | redirect `/personas/<id>` |
| `updatePersona` | same + id | transaction: clear links, update | `/personas/<id>`, project, `/personas` | `{success}` |
| `deletePersona(id, pid)` | — | delete | project, `/personas` | redirect `/personas?projectId=` |
| `createFinding` (`finding.ts`) | projectId, interviewId, title, description, category, severity | create | project, `/findings` | redirect `/findings/<id>` |
| `updateFinding` | same + id | update | `/findings`, project, `/findings/<id>` | `{success}` |
| `deleteFinding(id, pid)` | — | delete (cascade recs) | `/findings`, project | redirect `/findings?projectId=` |
| `createRecommendation` (`recommendation.ts`) | findingId, title, description, status, priority | create; `projectId` from finding | `/recommendations` | redirect `/recommendations?projectId=` |
| `updateRecommendation` | id, (findingId ignored), title, description, status, priority | update | `/recommendations` | `{success}` |
| `deleteRecommendation(id, pid)` | — | delete | `/recommendations` | redirect `/recommendations?projectId=` |
| `createJourneyMap` (`journeyMap.ts`) | projectId, title, description, stagesJson | create map + stages | project, `/journey-maps` | redirect `/journey-maps/<id>` |
| `updateJourneyMap` | same + id | transaction: delete stages, update map, recreate stages | `/journey-maps/<id>`, project, `/journey-maps` | `{success}` |
| `deleteJourneyMap(id, pid)` | — | delete | project, `/journey-maps` | redirect `/journey-maps?projectId=` |
| `extractSuggestions` (`ai.ts`) | projectId, interviewId?, transcript | Gemini call, **no DB writes** | — | `{suggestions, runId}` |
| `applySuggestions` | projectId, interviewId?, decisionsJson | transaction: update/create findings | `/findings`, project | redirect `/findings?projectId=` |

Zod limits per entity are listed in §5; schemas live in `src/lib/validations/*.ts` (and inline `extractSchema`/`applySchema` in `actions/ai.ts`).

### 7.4 Read layer

`src/server/queries/*.ts` are plain async functions used by Server Components: `getAllProjects`, `getProjectById`; `getInterviewsByProject`, `getInterviewById`; `getPersonasByProject`, `getPersonaById`; `getFindingsByProject`, `getFindingById`; `getRecommendationsByProject`, `getRecommendationById`; `getJourneyMapsByProject`, `getJourneyMapById`; `getDashboardData`; `searchProject`. The `*ById` functions are wrapped in React `cache()` so `generateMetadata` and the page share one query per request.

---

## 8. External integrations

**Only one: Google Gemini** (`src/server/ai/gemini.ts`), used solely by the AI transcript feature.

- **Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/interactions` (the "Interactions API") with header `x-goog-api-key: $GEMINI_API_KEY`. Body: `{ model, input, response_format: { type: "text", mime_type: "application/json", schema } }`.
- **Model:** `GEMINI_MODEL` env var, default `"gemini-3.8-flash"`.
- **Response handling:** `extractText` requires `status === "completed"` (if a status is present) and concatenates text from `steps[type="model_output"].content[type="text"]`; `apiErrorMessage` handles both `{error}` and array-wrapped / `{errors[]}` error bodies; output is `JSON.parse`d and then Zod-checked in `toSuggestions`.
- **Reliability/limits:** `AbortSignal.timeout(90_000)`, `cache: "no-store"`. **No retries, no rate limiting, no caching, no backoff, no cost/usage tracking.** Input is bounded to 60,000 characters. Errors surface as `Extraction failed. <detail>` in the UI.
- **Privacy:** transcript text and existing finding titles/descriptions are sent to Google when the feature is used; the UI shows a privacy notice. Everything else in the app makes no external network calls at runtime.
- **Unverified:** I could not confirm the request/response shapes or the model name `gemini-3.8-flash` against Google's live documentation (no network check was made); the code's own self-check (`transcript.check.ts`) only verifies internal consistency with these assumed shapes.
- **Build-time network:** `next/font/google` downloads Inter and Cormorant Garamond during `next dev`/`next build` (a production build succeeded in this environment).

---

## 9. Configuration

Environment variables (names and purpose only; `.env` is git-ignored, `.env.example` documents them as optional):

| Variable | Read in | Purpose |
|---|---|---|
| `AI_FEATURES` | `src/lib/flags.ts` | `on` enables `/ai/transcripts`, its nav link and the AI actions; anything else keeps it off |
| `GEMINI_API_KEY` | `src/server/ai/gemini.ts` | Gemini API key, server-side only |
| `GEMINI_MODEL` | `src/server/ai/gemini.ts` | Overrides default model |

Note: `.env` is read when the server starts, and `GEMINI_MODEL` is evaluated at module load (`export const GEMINI_MODEL`), so restart after changing either.

Other configuration:

- **Database location:** hard-coded `prisma/dev.db` in two places — `prisma.config.ts` (`file:./prisma/dev.db`, for the CLI) and `src/lib/db.ts` (`path.join(process.cwd(), "prisma", "dev.db")`, for the app). The app must therefore be started with the repo root as the working directory. There is no `DATABASE_URL`.
- **Seed command:** configured only in `prisma.config.ts` (`migrations.seed`).
- **Build flags:** `next.config.ts` sets only `serverExternalPackages: ["better-sqlite3"]`.
- **Design tokens:** `src/app/globals.css` (`:root` palette from `DESIGN.md`, Tailwind `@theme inline` mapping, type scale utilities `text-display-md`, `text-display-sm`, `text-caption-upper`).
- **`package.json` `allowScripts`** lists packages permitted to run install scripts (`better-sqlite3`, `prisma`, `@prisma/engines`, `esbuild`, `sharp`, `unrs-resolver`).

---

## 10. Setup and running

Commands below come from `package.json`, `prisma.config.ts` and `RUN_INSTRUCTIONS.txt`. On 2026-09-30 I ran `npx tsc --noEmit` (no errors), `npx eslint` (no output/errors), `npx tsx src/server/ai/transcript.check.ts` (passed) and `npm run build` (succeeded). I did **not** run `npm install`, `migrate` or `db seed` (the seed would wipe the existing DB, which currently equals the seed data).

```bash
npm install                 # postinstall runs `prisma generate`
cp .env.example .env        # Windows: copy .env.example .env   (all variables optional)
npx prisma migrate dev      # creates/updates prisma/dev.db from prisma/migrations
npx prisma db seed          # runs `npx tsx prisma/seed.ts` — WIPES existing data, loads demo study
npm run dev                 # http://localhost:3000  (port busy: npm run dev -- -p 3001)
```

| Script (`package.json`) | Command |
|---|---|
| `npm run dev` | `next dev` |
| `npm run build` | `next build` (Turbopack; TypeScript is checked as part of it) |
| `npm run start` | `next start` (serves the build on :3000) |
| `npm run lint` | `eslint` |
| `postinstall` | `prisma generate` |

- **Type-check:** `npx tsc --noEmit` (no script defined).
- **Tests:** none. The only automated check is the standalone AI script: `npx tsx src/server/ai/transcript.check.ts`.
- **Reset DB:** `npx prisma migrate reset` then `npx prisma db seed` (destroys all data).
- **Enable AI:** put `AI_FEATURES=on` and `GEMINI_API_KEY=<key>` in `.env`, restart.
- **Troubleshooting** (from `RUN_INSTRUCTIONS.txt`): "Cannot find module better-sqlite3"/Prisma client errors → `npm install` + `npx prisma generate`; `/ai/transcripts` 404 → flag not set or server not restarted; "API key not valid" → key missing/whitespace/quotes.
- **Deployment:** no deployment config exists (no Dockerfile, CI, Vercel config). Production = `npm run build && npm run start` on a machine with a writable persistent filesystem for `prisma/dev.db` and the native `better-sqlite3` module. **Inference, not documented in the repo:** a serverless/ephemeral-filesystem host would not suit this storage model.

---

## 11. Current status

### 11.1 Complete (by reading the code and a successful build)

Projects, interviews, personas, findings, recommendations and journey maps each have full CRUD with Zod validation, not-found pages and loading/error boundaries; dashboard (5 stat cards + 5 charts, project-scoped and filterable); cross-entity search; URL-based filters; printable report; opt-in AI transcript extraction with human review; responsive sidebar/mobile nav; toast feedback; seed data and migrations. `tsc`, `eslint` and `next build` are clean. No `TODO`/`FIXME`/`HACK` comments exist in `src` or `prisma`; the only marker is one `ponytail:` note in `src/server/actions/ai.ts`.

### 11.2 Stubbed / half-finished

None found (no placeholder pages). Partial or intentionally minimal: the recommendations board is display-only (no drag/drop, no inline status change); the journey-map editor is list-based; project status is stored but not editable; `avatarUrl` is only a pasted URL (no upload).

### 11.3 Known bugs and gaps (from reading the code; none reproduced at runtime)

1. **Broken links on the finding detail page** — "Create first recommendation" lacks `projectId` (page redirects away) and "View in board" passes an ignored `findingId`. See §5.4.
2. **Interview edit cannot clear optional fields** (`|| undefined` + Prisma ignores `undefined`). See §5.2.
3. **Project status is not editable in the UI** (hidden input); `ARCHIVED`/`COMPLETED` can only be set in the DB. See §5.1.
4. **Cross-project link integrity is not enforced** for `Persona.interviewIds` and `Finding.interviewId`, and `updateInterview/updatePersona/updateFinding` write `projectId` from the form rather than the DB (only `updateJourneyMap`, `createRecommendation` and the AI actions derive/verify it). A crafted POST could link or move records across projects; low risk for single-user local use, but the UI does not guard it.
5. **AI review edge:** changing the interview dropdown after extraction re-targets where approved findings link (§5.11). A file up to 200 KB is accepted client-side but the server limit is 60,000 characters.
6. `DeleteProjectButton` copy omits journey maps from the list of deleted items.

### 11.4 AUDIT.md reconciliation

`AUDIT.md` (dated 2026-09-23) describes a **much earlier** state of the repo (a founder-fundraising domain, stubbed interviews, no journey maps, no migrations folder, string-typed enums). The current code has resolved most of it, so the file misleads if read as current. Checked against the present code:

- **Fixed since the audit:** interview list/detail/new/edit UI exists; journey maps exist end to end; seed and schema now match the README (14/3/5/8/1); Prisma enums replace string columns; `Recommendation.projectId` and `Project.recommendations` exist; persona age range/occupation are real columns (no `JSON.parse(demographics)`); finding severity sort is correct (`SEVERITY_RANK`); dashboard no longer goes stale (`connection()` in the `(app)` layout; build output shows dynamic); delete failures show a toast (`useDeleteAction`); a `prisma/migrations/` folder now exists; the dead actions/queries it listed (`updateRecommendationStatus`, `getRecommendationsByStatus`, `searchInterviews`, and `ProjectStatCard.href`) no longer exist; README no longer has `create-next-app` boilerplate; fonts comment/`--font-geist-mono` issue is gone.
- **Still true today:** the two broken finding→recommendation links; project status not editable; missing same-project validation for persona/finding links; `shadcn` (a CLI package) still listed under `dependencies`.

Recommendation: delete `AUDIT.md` or regenerate it, to avoid misleading future readers.

### 11.5 History

The folder is **not a git repository** (no `.git`), so there is no commit history to summarize. Evidence of evolution: `AUDIT.md` (earlier, different-domain state) → two migrations dated 2026-09-23 (`init`, then `journey_stage_links`, which converted journey stages from single `findingId`/`personaId` columns to many-to-many links) → current code. The existing `.next` build folder predates this session; I rebuilt it with `npm run build`.

---

## 12. Suggested improvements

**Correctness / UX**
- Fix the two finding-detail links (append `projectId`; either support `findingId` on the board or remove the link).
- In `updateInterview`, send `null` (not `undefined`) for emptied optional fields, as the other update actions do.
- Add a status control to `ProjectForm` (archive/complete) or remove the dead Archived styling.
- Add inline status change / drag-and-drop on the recommendations board.
- Add pagination or a cap to list pages and `getDashboardData`'s `findMany` (everything is loaded unbounded).

**Security / integrity (needed before any multi-user or hosted use)**
- Add authentication and authorization; server actions are currently callable by anyone with network access.
- In all update actions, read `projectId` from the DB (as `updateJourneyMap` does) and verify linked `interviewId`/`interviewIds` belong to that project.
- Add a DB-level guard or enforce friction-range/age constraints consistently (SQLite has no `CHECK` through Prisma here).
- If the AI feature is used with real data: add rate limiting/usage limits, retries with backoff, and a consent/retention note.

**Maintainability / technical debt**
- Enum values are duplicated by hand in several places: `FindingForm` (severity/category `<option>`s), `RecommendationForm` (priority/status options), `TranscriptExtractor` `CATEGORY_OPTIONS`, `CategoryBadge` `CATEGORIES`, `dashboard.ts` `CATEGORY_LABEL`, plus `lib/tones.ts`. Derive them from the Prisma enums (`Object.values`) plus one label map per enum to prevent drift.
- The DB path is defined twice (`prisma.config.ts` and `src/lib/db.ts`); consider a single `DATABASE_URL`.
- Version skew: installed `prisma` CLI is 7.10.0 while `@prisma/client` is 7.8.0; pin them together. Move `shadcn` (CLI) to `devDependencies`.
- Add tests: only the AI helper has a script, and it is not in `npm` scripts. Good first targets: Zod schemas, `getDashboardData` (`orderByEnum`, `weekStart`), `linksBelongToProject`, `toSuggestions`. Add a `tsc`/`test` script and CI.
- Remove or regenerate the stale `AUDIT.md`.
- `Persona.avatarUrl` loads an arbitrary remote image via `<img>` (leaks viewer IP to that host); consider restricting or removing.
- No dark-mode theme actually wired up despite a `.dark` token block.

**Features (per README "Future Improvements")**
- Multi-user collaboration, cross-transcript AI clustering and persona/journey suggestions, a drag-and-drop journey editor, server-generated PDF, and a hosted database.

---

## 13. How to extend

**Add a new entity (checklist, mirroring existing ones):**
1. `prisma/schema.prisma` → add model/enums (with `projectId` + `onDelete: Cascade` and an index) → `npx prisma migrate dev --name <name>`.
2. `src/lib/validations/<entity>.ts` — `create<Entity>Schema` and `update…Schema = create.extend({ id: z.string().uuid() })`.
3. `src/server/queries/<entity>.ts` — list-by-project (with filters) and `getXById` wrapped in `cache()`.
4. `src/server/actions/<entity>.ts` — `"use server"`; create/update as `(prev, formData) => ActionResult`; delete as `(id, projectId)`; `revalidatePath`; `redirect` on create/delete; return `{message}` on failure (never throw on delete). Verify any linked ids belong to the project.
5. `src/components/features/<entity>/` — Card, Form (`useActionState` + `useActionToast`), DeleteButton (`useDeleteAction`).
6. `src/app/(app)/<entity>/` — `page.tsx` (await `searchParams`, use `ProjectSelector` + `FilterBar`), `new/`, `[id]/`, `[id]/edit/`, `[id]/not-found.tsx`.
7. Wire in: `LINKS` in `components/layout/AppNav.tsx`; `searchProject`; `getDashboardData`; report page; seed.

**Add a value to an existing enum** (e.g. a new `FindingCategory`): schema + migration, then update every hand-maintained copy listed in §12 (forms, `CategoryBadge`, `CATEGORY_LABEL`, `TranscriptExtractor.CATEGORY_OPTIONS`). The AI JSON schema and Zod validators use `Object.values(FindingCategory)` and update automatically.

**Add a dashboard chart:** add a field to `DashboardData` and compute it in `getDashboardData` (use `orderByEnum` for enum breakdowns), render with `RampBarChart` (ordinal) or `FindingsBarChart` (nominal) inside a `ChartCard` in `dashboard/page.tsx`; add a `Figure` in the report page if it should print.

**Styling rules:** follow `DESIGN.md` — cream canvas, coral accent (AA-safe `primary-active` is what `--primary` maps to), serif display headings via `font-heading` with `text-display-md|sm`, Tailwind tokens from `globals.css`; charts use hex colors from `lib/tones.ts`. Use base-ui's `render` prop (not `asChild`) for polymorphic triggers.

**Before writing Next.js code**, read the relevant guide under `node_modules/next/dist/docs/` (AGENTS.md).
