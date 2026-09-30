# InvestorLens — Product Requirements Document

## Status

Built and working. This document describes the app as it currently exists, not a proposal.

## Problem

A UX researcher running interviews ends up with information in a lot of different places: interview notes in one document, a spreadsheet of pain points, a slide deck of personas, another document for recommendations. Nothing forces those pieces to stay connected to each other, so by the time someone asks "which recommendations came out of the KYC complaints?" the researcher has to go digging through several files by hand.

InvestorLens gives a research project one place to hold all of that, with the pieces linked to each other from the start: an interview can point at the findings it produced, a finding can point at the recommendation it led to, and a journey stage can point at the findings and personas that back it up.

## Who it's for

One researcher (or a small team sharing one machine/database) running a single research project at a time, who wants:
- somewhere to log interviews and pull recurring findings out of them,
- a way to organize findings into personas and a journey map,
- a way to turn findings into a tracked list of product recommendations,
- a dashboard and a printable report to hand to someone else.

It is not built for multiple researchers working on the same project at the same time, and it is not built for managing many research projects across an organization — see [Out of Scope](#out-of-scope).

## Core Features

### Projects
The container everything else lives in. A project has a name, a description, and a status (Active, Completed, or Archived). You pick a project at the top of every page before you can see or add anything else.

### Interviews
One record per person interviewed: their name, age, occupation, employer, which investing platform they use, a free-text description of their investing behavior/goals/frustrations, the date, and full interview notes. An interview can be linked to the findings it produced and the personas it fed into.

### Personas
A summary of a type of user, built up from one or more interviews: a name, a role, an age range, an occupation, their goals, and their frustrations. Used to represent "this is roughly what this kind of user is like" rather than one specific person.

### Findings
A specific, recurring problem the research turned up: a title, a description, a category (KYC, Onboarding, Research, Portfolio, Support, or Other), and a severity (Low, Medium, High, or Critical). A finding can optionally be traced back to the one interview that surfaced it most clearly.

### Recommendations
A proposed fix for a specific finding: a title, a description, a priority (Low, Medium, High), and a status that moves through a pipeline — Proposed, Approved, In Progress, Completed. Every recommendation belongs to exactly one finding. The recommendations page shows them as a board, one column per status.

### Journey Maps
A journey map is an ordered list of stages a user goes through (for example: discover the platform, sign up, complete KYC, fund the account, research an investment, place it, then track the portfolio). Each stage has a name, a description, a friction rating from 0 (no friction) to 5 (severe), and an optional label for the kind of friction (confusion, friction, delay, uncertainty, or other). A stage can be backed by any number of findings and personas as evidence. Stages rated 4 or 5 are called out as high-friction wherever the journey map is shown.

### Dashboard
A live summary of one project (or of everything, if no project is selected): total counts for each entity type, and five charts — findings by severity, findings by category, recommendations by status, findings by platform, and findings discovered over time. Every number comes from a real database query at the time the page loads; nothing on the dashboard is a hardcoded example.

### Search
A single search box that looks across interviews, findings, personas, and recommendations in one project at once, so you don't have to know which entity type holds the thing you're looking for.

### Filters
The findings, interviews, and recommendations list pages each have their own filters (category/severity/persona for findings; platform/age range for interviews; priority/status for recommendations). The filter state lives in the page's URL, so a filtered view can be bookmarked or shared as a link.

### Report Export
A one-click printable report for a project: an auto-written executive summary, a table of every participant, every finding, every persona, the journey map(s), every recommendation grouped by status, and the same charts as the dashboard. "Print / Save as PDF" hands this to the browser's own print dialog — there's no separate PDF-generation step to configure.

## AI Analysis Feature

### What it does
A separate, opt-in page where a researcher pastes or uploads one interview transcript. The app sends the transcript text to Google's Gemini API and asks it to pull out candidate pain points. For each one, Gemini returns a supporting quote, a one-sentence summary, and either a match to an existing finding in the project or a suggestion for a brand-new one (with a proposed title, category, and severity).

### The review step
Nothing is saved automatically. The researcher sees every suggestion and has to approve or reject each one individually before anything touches the database. They can edit a suggested new finding's title, category, or severity before approving it. Only after clicking "Save" do the approved suggestions become real findings (or evidence added to existing ones).

### Built-in guardrails
Because the model's output can't be trusted outright, the app checks it before showing it to the researcher:
- the reply has to match an expected structure, or the request is treated as failed;
- if Gemini names a finding ID that doesn't actually belong to the project, that suggestion is downgraded to "new finding" instead of silently matching the wrong thing;
- every quote is checked against the actual transcript text, and a quote that doesn't appear verbatim is flagged for the researcher, since a paraphrased or invented quote is a sign the model made something up.

### Scope and limits (as of this version)
- One transcript at a time — no batch upload, no analyzing multiple interviews together.
- Findings only — it does not suggest new personas or new journey-map stages.
- No cross-interview theme clustering — each run only sees the one transcript and the findings that already exist in the project.
- Off by default. It has to be turned on with an environment variable, and it needs a Gemini API key to actually run.

## Out of Scope

Not part of this version, and not planned as a near-term addition without a separate decision to build them:

- **User accounts or login.** There's no concept of "who" is using the app — it's single-user by design.
- **Multiple people editing the same project at once.** No conflict handling, no real-time sync.
- **Managing many research projects across a team or organization.** It's built around one researcher working through one project's data at a time.
- **Cloud hosting or a production database.** The database is a local SQLite file, meant to run on one machine.
- **Automatic, unsupervised AI writes.** Every AI suggestion requires a human to approve it before it's saved — this is a deliberate limit, not a gap to be closed later.
- **A dedicated drag-and-drop journey-map editor.** Stages are currently added and reordered as a list, not a visual canvas.
- **A real PDF-generation library.** The "export" is the browser's print-to-PDF, not a server-rendered PDF file.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Actions for all writes)
- **Language:** TypeScript throughout
- **UI:** React 19, Tailwind CSS v4, base-ui/react component primitives
- **Charts:** Recharts
- **Validation:** Zod, shared between the client forms and the server-side actions so both sides agree on what's valid
- **Database:** SQLite — a single local file, no server process to run
- **ORM:** Prisma, using the `better-sqlite3` driver adapter
- **AI:** Google Gemini API, called directly with `fetch` (no vendor SDK dependency), used only by the opt-in transcript-analysis feature

No authentication library, no cloud database, no external services required for the core app to run — the whole point is that `npm install` and a few commands get you a fully working copy on your own machine.
