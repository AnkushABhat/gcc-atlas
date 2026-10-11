# Build plan

Tick a box only when its acceptance criteria pass and `pnpm verify` is green.
M2 (data) can run in parallel with M1 and M3-UI shell. Others are sequential. One agent per milestone is fine.

- [x] **M0 Scaffold.** Next.js + TS strict + Tailwind + Drizzle/libSQL + Vitest + Playwright + the commands in `AGENTS.md`. CI from `.github/workflows/`. Accept: `pnpm verify` passes on a blank page; `pnpm dev` serves.
- [x] **M1 Schema and validation.** Tables per `src/db/AGENTS.md`, seed loader, `pnpm data:validate`. Accept: seeding the empty files works; validator fails on a fact with no source or as-of.
- [x] **M2 Data research.** Fill `data/seed/*` following `data/AGENTS.md`. Start with 6 cities. Record gaps in `data/research/gaps.md`. Accept: validator green; every city has at least rent range and talent facts or an entry in gaps.
- [x] **M3 Planner.** Module + page. Accept: unit tests in `src/modules/planner/AGENTS.md` pass; weights change the ranking; incomplete cities show "not ranked".
- [ ] **M4 Providers.** Directory, filters, profile, claim flow (demo). Accept: filter by category + city; claimed profile shows owner badge.
- [ ] **M5 Leads.** Intro request, routing, provider inbox, credits. Accept: e2e flow in `tests/AGENTS.md` passes; cap of 3 enforced; refund path works.
- [ ] **M6 Polish.** Design pass per `src/components/AGENTS.md`, empty and error states, `docs/demo.md` 3-minute script. Accept: no console errors; keyboard-navigable; Lighthouse accessibility >= 95 on Planner and Inbox.
