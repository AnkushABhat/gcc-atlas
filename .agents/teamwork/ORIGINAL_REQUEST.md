# Original User Request

## 2026-10-11T18:07:57Z

Build the core foundation of GCC Atlas (Milestones M0 through M3): an interactive single source of truth for leaders setting up Global Capability Centres in India, featuring a project scaffold with full CI/verification toolchain, data schema & provenance validator, research seed data for Indian cities, and the Setup Planner module with ranking and cost estimation.

Working directory: /home/anusama/Projects/gcc-atlas
Integrity mode: development

## Verification Resources
- Project specification and coding standards: `AGENTS.md` and `docs/architecture.md`
- Milestone roadmap and acceptance criteria: `docs/build-plan.md` (Milestones M0, M1, M2, M3)
- Subsystem specifications: `src/db/AGENTS.md`, `src/modules/planner/AGENTS.md`, `src/components/AGENTS.md`, `data/AGENTS.md`, and `tests/AGENTS.md`
- Architecture Decision Records: `docs/decisions/` (ADR 001 - ADR 006)

## Requirements

### R1. Application Scaffold & Verification Toolchain (M0)
Scaffold a Next.js (App Router), TypeScript (strict mode), Tailwind CSS, Drizzle ORM, libSQL, Vitest, and Playwright project matching the stack defined in ADR 001. Ensure the standard project commands work seamlessly out of the box (`pnpm install`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm dev`, and `pnpm verify` covering typecheck, lint, unit tests, data validator, and e2e smoke test).

### R2. Database Schema, Seed Loader, and Provenance Validator (M1 & M2)
Implement the database schema for states, cities, facts, incentives, providers, and GCCs per `src/db/AGENTS.md` using Drizzle ORM and libSQL. Create seed loaders and a strict provenance validation script (`pnpm data:validate`) that guarantees zero invented or unverified figures—every number or incentive fact must have a valid `source_url` and `as_of` date, or be tracked in `data/research/gaps.md`. Populate verified seed data for at least 6 candidate Indian cities.

### R3. Setup Planner Domain Engine & User Interface (M3)
Build the Setup Planner module and page enabling users to input GCC parameters (headcount, functional weights, talent and cost preferences) and receive ranked candidate cities, estimated setup cost ranges formatted in INR (`en-IN` lakh/crore), and applicable state incentives. Follow ADR 003, ADR 004, and ADR 005: preserve data provenance, never impute missing data, display "not ranked" for cities with incomplete facts, and separate ranking logic strictly from payment/leads.

## Acceptance Criteria

### Toolchain & Quality Verification
- [ ] `pnpm verify` passes cleanly with zero errors (typecheck, lint, unit tests, and data validation).
- [ ] `pnpm db:migrate` and `pnpm db:seed` run locally without errors and produce `local.db` with no external environment variables required.
- [ ] The app starts cleanly with `pnpm dev` and serves the home and planner pages without runtime exceptions or console errors.

### Data & Provenance Guardrails
- [ ] `pnpm data:validate` fails with a non-zero exit code if any factual figure or incentive is missing a `source_url` or `as_of` date.
- [ ] Seed data in `data/seed/` contains valid entries for at least 6 cities with rent and talent facts, or explicit entries in `data/research/gaps.md`.

### Setup Planner Functionality
- [ ] Planner unit tests in `src/modules/planner/` pass, verifying weight-based ranking calculations and cost range estimations.
- [ ] Adjusting priority weights in the planner changes the resulting city rankings predictably.
- [ ] Cities with missing metrics are clearly presented as "not ranked" rather than imputed or hidden.
- [ ] All displayed figures show their source attribution and as-of date.


## 2026-10-11T19:00:25Z

Environment permissions have been granted: write_to_file and commands now execute successfully, and Node.js v26.8.1 and pnpm 11.3.0 are installed and available in PATH. Please resume execution of Milestones M0 through M3.
