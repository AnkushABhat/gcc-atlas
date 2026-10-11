## 2026-10-11T19:01:54Z

You are Worker 2 for Milestone M0: Application Scaffold & Verification Toolchain.
Your working directory is: /home/anusama/Projects/gcc-atlas/.agents/teamwork/worker_m0_2
The project workspace root is: /home/anusama/Projects/gcc-atlas
Authoritative request: /home/anusama/Projects/gcc-atlas/.agents/teamwork/ORIGINAL_REQUEST.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Context & Mission:
Environment permissions have been granted (full write_to_file and terminal command execution; Node.js v26 and pnpm v11 are in PATH).
Your mission is to execute and verify Milestone M0 (Scaffold & verification toolchain per ADR 001 and docs/build-plan.md).

### Files to Create:
1. Initialize git repo if not already initialized: `git status` -> if not git repo, `git init`.
2. `package.json`:
   Dependencies: `@libsql/client` (^0.14.0), `drizzle-orm` (^0.39.0), `lucide-react`, `next` (^15.1.0), `react` (^19.0.0), `react-dom` (^19.0.0), `zod` (^3.24.1).
   DevDependencies: `@playwright/test`, `@types/node`, `@types/react`, `@types/react-dom`, `autoprefixer`, `drizzle-kit`, `eslint`, `eslint-config-next`, `postcss`, `tailwindcss`, `tsx`, `typescript`, `vitest`.
   Scripts:
   - `dev`: `next dev`
   - `build`: `next build`
   - `start`: `next start`
   - `lint`: `next lint`
   - `typecheck`: `tsc --noEmit`
   - `test`: `vitest run`
   - `test:e2e`: `playwright test`
   - `db:generate`: `drizzle-kit generate`
   - `db:migrate`: `tsx scripts/migrate.ts`
   - `db:seed`: `tsx scripts/seed.ts`
   - `data:validate`: `tsx scripts/validate-data.ts`
   - `verify`: `pnpm typecheck && pnpm lint && pnpm test && pnpm data:validate && pnpm test:e2e`
3. `tsconfig.json`: Strict mode (`strict: true`, `noImplicitAny: true`, etc.), path alias `@/*` -> `./src/*`.
4. `tailwind.config.ts`, `postcss.config.mjs`, `src/app/globals.css`:
   - Warm neutral grays, deep teal `#005f60` primary, neutral borders.
5. App Router files:
   - `src/app/layout.tsx`: Root layout with clean typography, persistent header banner: "GCC Atlas Prototype — nothing is sent to anyone" per ADR 006.
   - `src/app/page.tsx`: Home page shell with headline, description, link to `/planner`.
6. Database layer (`src/db/`):
   - `drizzle.config.ts`: schema `./src/db/schema.ts`, out `./src/db/migrations`, dialect `sqlite`, dbCredentials url `file:local.db`.
   - `src/db/client.ts`: `@libsql/client` createClient connecting to `file:local.db`, drizzle instance exported.
   - `src/db/schema.ts`: Drizzle schema for all 9 tables defined in `src/db/AGENTS.md`: `states`, `cities`, `facts`, `incentives`, `gccs`, `providers`, `leads`, `lead_offers`, `credit_ledger`.
     CRITICAL: `cities` table MUST NOT have numeric columns (ADR 003).
     CRITICAL: `credit_ledger` must be append-only with `SUM(delta)` determining balance.
7. Scripts:
   - `scripts/migrate.ts`: Runs drizzle migrations from `./src/db/migrations` using `drizzle-orm/libsql/migrator`.
   - `scripts/seed.ts`: Idempotently upserts JSON records from `data/seed/*.json` (`states`, `cities`, `facts`, `incentives`, `gccs`, `providers`). Grants initial 5 `demo_grant` credits to each provider whose ledger is empty.
   - `scripts/validate-data.ts`: Validates `data/seed/*.json` with Zod. Enforces HTTPS source_url, as_of <= today, value_min <= value_max, metric in closed set (`office_rent_inr_sqft_month`, `tech_talent_count`).
8. Testing:
   - `vitest.config.ts`: Vitest config with `@/*` alias.
   - `tests/unit/smoke.test.ts`: Tests verifying schema structure (cities has no numeric columns, all 9 tables exist).
   - `playwright.config.ts`: Playwright config with webServer running `pnpm dev` on port 3000.
   - `tests/e2e/smoke.spec.ts`: E2E test verifying home page renders prototype header banner and title.

### Execution & Verification Steps:
1. Write all above files.
2. Run `pnpm install`.
3. If playwright browsers not installed: `pnpm exec playwright install chromium`.
4. Run `pnpm db:generate` to produce the initial migration SQL in `src/db/migrations`.
5. Run `pnpm db:migrate` -> verifies local.db is created and migrated.
6. Run `pnpm db:seed` -> verifies seed script runs cleanly on initial empty seed arrays.
7. Run `pnpm verify` -> verifies typecheck, lint, vitest unit tests, data:validate, and playwright e2e tests all pass with exit code 0.
8. Document all commands and outputs in your handoff report. Send a message when complete.
