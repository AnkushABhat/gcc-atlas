# GCC Atlas

## What this is
Prototype of a single source of truth for companies setting up Global Capability Centres (GCCs) in India.
First user: the leader setting up a new GCC (always free). First payer: service providers
(setup advisors, real estate, EOR, legal) who pay for qualified setup leads. Scope: `docs/product.md`.

The slice that must work end to end:
1. Setup Planner: inputs -> ranked cities, cost ranges, state incentives. Every figure sourced.
2. Provider directory and profiles.
3. Intro request -> lead -> offered to at most 3 matched providers.
4. Provider inbox: accept (spends 1 credit) or decline. Credit ledger.
Anything else is out of scope. Do not add features.

## Run
```
pnpm install
pnpm db:migrate && pnpm db:seed   # creates local.db; no env vars needed locally
pnpm dev                          # http://localhost:3000
```
These commands are a contract. Milestone M0 in `docs/build-plan.md` creates them. Env vars: `.env.example`.

## Verify
```
pnpm verify    # typecheck + lint + unit tests + data:validate + e2e
```
"Done" also requires opening the running app in the browser and completing
Planner -> intro request -> provider inbox by hand. Passing tests alone is not done.

## Layout
- `src/app/` routes and UI. Calls modules only.
- `src/modules/<name>/` domain logic, framework-free TypeScript. One folder per concept.
- `src/db/` Drizzle schema and migrations.
- `src/components/` shared UI and design tokens.
- `data/` seed files and research notes. `scripts/` seed and validators. `tests/` e2e.
- `docs/` product, architecture, ADRs, build plan.

Before editing a directory, read its `AGENTS.md`. When you change behavior, update that file in the same change.
Dependency direction: `app -> modules -> db`. Modules talk to each other only via `index.ts`.

## Rules everywhere
1. Never invent data. Every number, incentive, provider and GCC needs a source URL you actually opened. No source: leave it null. Details: `data/AGENTS.md`.
2. Never show a figure without its source and as-of date in the UI.
3. Payment never affects ranking or ordering. Only lead eligibility and credits. ADR 005.
4. The prototype sends no real messages to anyone. Say so in the UI. ADR 006.
5. Every visible control works or is not rendered. No dead buttons, lorem ipsum, fake testimonials, fake logos, fake reviews.
6. No new dependency without a one-line reason in the commit message. Prefer the platform and existing deps.
7. No dead code, no commented-out code, no comments that restate the code. Comment only why.
8. TypeScript strict. No `any`, no non-null `!` without a comment saying why it holds.
9. Validate all external input with Zod at the boundary (server actions, seed loaders).
10. Money: integer INR. Dates: ISO 8601 UTC in storage. Display with `en-IN` formatting (lakh/crore).
11. Copy is plain and specific. No "AI-powered", "seamless", "revolutionary".
12. If blocked or a decision is missing, write it in `docs/open-questions.md` and continue with the safest option. Do not guess silently.

## Where to look
| Question | File |
|---|---|
| What are we building and why | `docs/product.md` |
| How the pieces fit | `docs/architecture.md` |
| Why a choice was made | `docs/decisions/` |
| What to build next | `docs/build-plan.md` |
| How to source data | `data/AGENTS.md` |
| Workflows (slash commands) | `.agent/workflows/` |
