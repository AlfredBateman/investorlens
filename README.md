# InvestorLens

**InvestorLens** is a local-first UX research management platform for organizing retail-investor user research: interview records, personas, findings, product recommendations, and journey maps, tied together with a dashboard, cross-entity search, filters, a printable research report, and an opt-in AI transcript-analysis feature.

The included sample project is a retail-investor UX study — interviewing people who use Zerodha, Groww, Upstox, and Angel One — but the app itself is generic: it works for any research project made of interviews, personas, findings, and recommendations.

---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [AI Transcript Analysis](#ai-transcript-analysis)
* [Technology Stack](#technology-stack)
* [Data Model](#data-model)
* [Getting Started](#getting-started)
* [Environment Variables](#environment-variables)
* [Project Structure](#project-structure)
* [Sample Research Project](#sample-research-project)
* [Current Scope](#current-scope)
* [Limitations](#limitations)
* [Future Improvements](#future-improvements)
* [Security & Privacy](#security--privacy)
* [Troubleshooting](#troubleshooting)
* [Disclaimer](#disclaimer)

---

## Overview

A UX researcher's raw material — interview notes, recurring pain points, personas, journey friction, product recommendations — is normally scattered across documents, spreadsheets, and slide decks. InvestorLens gives that material one structured home per research project, with the workflow:

```text
Project
  └── Interviews  →  Findings  →  Personas / Journey Maps  →  Recommendations
                                          │
                                     Dashboard, Search, Filters, Report
```

It does not replace a researcher's judgment. It stores what they've already learned in a structured, filterable, exportable form, and — optionally — uses an LLM to suggest a first pass at pulling pain points out of a raw transcript for the researcher to accept or reject.

---

## Features

### Projects
The top-level container. A project has a name, description, and status (Active / Completed / Archived). Every other entity belongs to exactly one project. Full create/edit/delete.

### Interviews
One record per participant: name, age, occupation, employer, the investing platform they use, their investing behavior/goals/frustrations in their own words, the interview date, and full free-text notes. Interviews can be linked to the findings and personas they informed.

### Personas
A synthesized user type: name, role, age range, occupation, goals, and frustrations, linked to the interviews it was derived from.

### Findings
A recurring pain point: title, description, category (KYC, Onboarding, Research, Portfolio, Support, Other), and severity (Low/Medium/High/Critical), optionally tied to the interview that surfaced it.

### Recommendations
A proposed product fix tied to a specific finding: title, description, priority (Low/Medium/High), and status (Proposed → Approved → In Progress → Completed). The recommendations page is a Kanban-style board grouped by status.

### Journey Maps
An ordered sequence of stages in a workflow (e.g., Discover Platform → Sign Up → KYC → Fund Account → Research → Place Investment → Track Portfolio). Each stage has a name, description, a friction rating (0–5), an optional pain-point type (Confusion / Friction / Delay / Uncertainty / Other), and can link to any number of findings and personas as supporting evidence. Stages rated 4–5 are visually flagged as high-friction.

### Dashboard
Live counts (projects, interviews, personas, findings, recommendations) and five charts, all computed from the current database state, not hardcoded: findings by severity, findings by category, recommendations by status, findings by platform (which platform's interviews produced the most findings), and findings discovered over time (weekly, based on the linked interview's date). Optionally scoped to one project, with the same category/severity/persona/priority filters available on the list pages.

### Search
One search box (`/search`) that looks across interviews, findings, personas, and recommendations within a selected project at once, matching on each entity's own text fields (interview name/role/notes, finding title/description, persona name/goals/frustrations, recommendation title/description).

### Filters
Every list page keeps its filter state in the URL, so a filtered view is a shareable link:
- **Findings** — category, severity, persona
- **Interviews** — platform, age range
- **Recommendations** — priority, status

### Report Export
`/report/[projectId]` renders a complete research report for one project — executive summary (auto-written from the data), participant overview table, all findings, all personas, all journey maps, all recommendations grouped by status, and the same charts as the dashboard. A "Print / Save as PDF" button opens the browser's own print dialog; there is no separate PDF library — the browser's print-to-PDF is the export mechanism.

---

## AI Transcript Analysis

`/ai/transcripts` is an **opt-in, off-by-default** feature (see [Environment Variables](#environment-variables)). It does not touch the core app when disabled — the route returns not-found and no nav link is shown.

When enabled, a researcher pastes or uploads an interview transcript. The transcript is sent to Google's **Gemini API**, which returns up to 15 candidate pain points, each with:
- a short quote copied from the transcript,
- a one-sentence summary,
- either a match to an existing finding in the project, or a suggested title/category/severity for a new one.

Nothing is written to the database at this stage. The researcher reviews every suggestion — approve or reject each one individually, editing a proposed new finding's title/category/severity first if they want — and only approved suggestions are saved when they click "Save." An approved match appends the quote to that finding's description as supporting evidence; an approved new suggestion creates a finding.

Built-in safeguards, since model output is treated as untrusted input:
- The model's JSON reply is schema-validated before use.
- A suggested match to a finding ID that isn't actually in the project is treated as a new-finding suggestion instead.
- Every quote is checked against the transcript text; a quote that doesn't appear verbatim is flagged in the UI so the researcher can catch a fabricated or paraphrased one before approving.
- The prompt instructs the model to treat the transcript as data, not instructions.
- If `GEMINI_API_KEY` is missing, the page shows a setup notice instead of a broken form.

This is intentionally a narrow first version: one transcript at a time, no automatic theme clustering across transcripts, and no automatic persona or journey-map suggestions.

---

## Technology Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS v4, base-ui/react primitives |
| Charts | Recharts |
| Validation | Zod (shared between client forms and server actions) |
| Database | SQLite (a single local file, `prisma/dev.db`) |
| ORM | Prisma, via the `better-sqlite3` driver adapter |
| AI (optional) | Google Gemini API, called directly over `fetch` (no SDK dependency) |

No PostgreSQL, no Docker, no external database service, and no authentication provider — everything runs from `npm install` to a working app on one machine.

---

## Data Model

```text
Project
  ├── Interview[]        (candidate info, platform, age, notes)
  ├── Persona[]           ←→ Interview  (many-to-many, via a join table)
  ├── Finding[]            → Interview  (optional single source interview)
  │      └── Recommendation[]
  ├── Recommendation[]    (also belongs directly to Project)
  └── JourneyMap[]
         └── JourneyStage[]  ←→ Finding[]   (many-to-many)
                             ←→ Persona[]  (many-to-many)
```

- **Recommendation** belongs to both a `Project` and the `Finding` it addresses; its `projectId` is always derived from the finding server-side, never taken from a form.
- **JourneyStage** carries an ordered `position` within its map, a `frictionRating` (0–5), an optional `painType`, and can reference any number of findings and personas as evidence for that stage.
- Enum-like fields (project status, finding category/severity, recommendation priority/status, investing platform, pain-point type) are real Prisma enums, stored as text in SQLite.

See `prisma/schema.prisma` for the exact fields, relations, and indexes.

---

## Getting Started

Full step-by-step instructions, including troubleshooting, are in **[RUN_INSTRUCTIONS.txt](./RUN_INSTRUCTIONS.txt)**. The short version:

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Available `npm` scripts (see `package.json`): `dev`, `build`, `start`, `lint`. `postinstall` runs `prisma generate` automatically after every `npm install`.

---

## Environment Variables

None are required for the core app. `.env.example` documents all of them:

| Variable | Required? | Purpose |
|---|---|---|
| `AI_FEATURES` | No | Set to `on` to enable `/ai/transcripts`. Any other value (or unset) keeps it off. |
| `GEMINI_API_KEY` | Only if `AI_FEATURES=on` | Your Google Gemini API key. Read server-side only; never sent to the browser, never hardcoded. |
| `GEMINI_MODEL` | No | Overrides the default model (`gemini-3.8-flash`). |

---

## Project Structure

```text
src/
├── app/
│   ├── (app)/              # Every feature page, sharing the sidebar/nav shell
│   │   ├── dashboard/
│   │   ├── projects/  interviews/  personas/  findings/  recommendations/  journey-maps/
│   │   ├── search/
│   │   └── ai/transcripts/     # Feature-flagged
│   └── report/[projectId]/     # Printable report — deliberately outside the app shell
├── components/
│   ├── ui/                 # Low-level primitives (button, input, toast, badge, ...)
│   └── features/           # Entity-specific components, one folder per entity
├── server/
│   ├── actions/             # "use server" mutations (create/update/delete), Zod-validated
│   ├── queries/              # Read-only Prisma queries used by Server Components
│   └── ai/                    # Gemini client + transcript-extraction logic and its self-check
├── lib/                       # Shared utilities, design tokens, feature flags
└── hooks/                     # Shared client hooks (URL filter state, delete confirmation, toasts)
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
```

---

## Sample Research Project

Loaded by `npx prisma db seed`:

| | |
|---|---|
| Project | Retail Investor UX Research — Zerodha vs Groww |
| Interviews | 14, ages 22–45, across Zerodha / Groww / Upstox / Angel One |
| Personas | 3 (New Investor, Active Trader, Passive SIP Investor) |
| Findings | 5, one per category, spanning all four severities |
| Recommendations | 8, spread across all four statuses |
| Journey Maps | 1, with 7 stages (3 flagged high-friction) |

Re-running the seed command replaces all existing data with this project.

---

## Current Scope

### Included
Project / interview / persona / finding / recommendation / journey-map management with full CRUD; a live dashboard; cross-entity search; per-page URL-based filters; a printable report; an opt-in AI transcript-analysis feature; SQLite + Prisma persistence.

### Not included
User authentication, multi-user collaboration, cloud deployment, and production-scale infrastructure. See [Future Improvements](#future-improvements).

---

## Limitations

- **Single-user, local-first.** No accounts, no login, no concurrent-editing protection — it assumes one person working against one local database file.
- **SQLite.** Fine for local use and a single research project at a time; not a multi-user production database.
- **AI extraction is a first pass, not a finished analysis.** It handles one transcript at a time, doesn't cluster themes across interviews, and every suggestion requires manual review before anything is saved. See [AI Transcript Analysis](#ai-transcript-analysis) for its exact scope.
- **Report export is print-to-PDF**, using the browser's print dialog rather than a dedicated PDF-generation library — layout depends on the browser's print rendering.

---

## Future Improvements

Not built yet:

- **Authentication & multi-user collaboration** — accounts, login, and shared project access.
- **Cross-transcript AI analysis** — clustering pain points across multiple interviews at once, and AI-suggested personas or journey maps (the current AI feature works one transcript at a time and only suggests findings).
- **A dedicated visual journey-map editor** — today a journey map's stages are edited as an ordered list; a drag-and-drop canvas is a possible upgrade.
- **A generated PDF via a PDF library**, as an alternative to the browser's print dialog, for pixel-exact layout control.
- **Production-scale infrastructure** — a server-based database, deployment tooling, and the access controls that come with a multi-user product.

---

## Security & Privacy

InvestorLens is built for local, single-user use. Interview data can contain personal or sensitive information — don't upload real participant data you aren't authorized to store or, if using the AI feature, to send to Google's servers.

If you enable AI transcript analysis, remember: transcript text you submit is sent to the Gemini API over the network. The rest of the app (everything except `/ai/transcripts`) makes no external network calls and keeps all data in the local SQLite file.

Deploying this beyond local, single-user use would need authentication, authorization, encryption at rest, secrets management, and a data-retention/consent policy for real research data — none of which are implemented here.

---

## Troubleshooting

See the **Troubleshooting** section of [RUN_INSTRUCTIONS.txt](./RUN_INSTRUCTIONS.txt) for setup issues (missing modules, database resets, port conflicts, and AI feature errors).

---

## Disclaimer

InvestorLens is an independent educational and portfolio project. The retail-investor research scenario is a demonstration dataset with fictional participants, and is not an official study by, or affiliated with, Zerodha, Groww, Upstox, Angel One, or any other platform referenced in it.
