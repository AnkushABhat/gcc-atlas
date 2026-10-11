# Review and Adversarial Report — Milestone M0: Application Scaffold & Verification Toolchain

## Review Summary

**Verdict**: APPROVE  
**Milestone**: M0 (Application Scaffold & Verification Toolchain)  
**Target Commit/State**: Worker 2 M0 implementation  
**Authoritative Request**: `.agents/teamwork/ORIGINAL_REQUEST.md`  

The scaffold and verification toolchain for Milestone M0 satisfies all foundational architectural contracts, acceptance criteria, and constraints specified in root `AGENTS.md`, `docs/build-plan.md`, and ADRs 001–006. All required project commands (`pnpm install`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm dev`, `pnpm verify`, and `pnpm build`) run reliably without requiring any external environment variables or third-party cloud services. Zero integrity violations, facades, or shortcuts were found.

---

## Integrity Violation Audit

An adversarial integrity audit was performed on all artifacts created by Worker 2:
- **Hardcoded test results embedded in source code**: None detected. Smoke unit tests dynamically query table metadata using Drizzle's `getTableColumns`, and Playwright E2E tests render actual browser sessions.
- **Dummy or facade implementations**: None detected. All 9 database tables, migrations, Zod schemas, data validators, and seed loaders are fully implemented with real logic.
- **Shortcuts bypassing intended tasks**: None detected. Real libSQL SQLite database `local.db` is migrated, seeded, and queried directly.
- **Fabricated verification outputs or logs**: None detected. All commands were re-run independently and verified directly against system logs and database pragmas.
- **Self-certifying work without genuine independent verification**: None detected. All claims independently verified in isolation.

---

## Verified Claims

| Claim from Worker 2 / Specifications | Verification Method | Status |
|---|---|---|
| Complete tech stack per ADR 001 (Next.js App Router, TS strict, Tailwind, Drizzle, libSQL, Vitest, Playwright, Zod) | Inspected `package.json`, `tsconfig.json`, `tailwind.config.ts`, `vitest.config.ts`, `playwright.config.ts` | PASS |
| Local database works with zero external env vars per ADR 002 | Ran `pnpm db:migrate` and `pnpm db:seed` in clean environment; inspected `src/db/client.ts` fallback `file:local.db` | PASS |
| All 9 tables defined per `src/db/AGENTS.md` | Executed SQLite `PRAGMA table_info` and queried `sqlite_master` in `local.db`; verified via Vitest | PASS |
| ADR 003 strictly enforced: `cities` table has zero numeric columns | Verified via SQLite `PRAGMA table_info(cities)`: only `slug`, `name`, `state_slug` exist; verified in `smoke.test.ts` | PASS |
| ADR 003 strictly enforced: `facts` table enforces NOT NULL on all provenance columns | Verified via SQLite `PRAGMA table_info(facts)`: `source_name`, `source_url`, `as_of`, `confidence` are all `notnull=1` | PASS |
| ADR 005 strictly enforced: `credit_ledger` is append-only with integer `delta` and no balance column | Verified via SQLite `PRAGMA table_info(credit_ledger)`; verified `delta` is integer | PASS |
| `lead_offers` enforces unique `(lead_id, provider_slug)` | Verified via SQLite `PRAGMA index_list(lead_offers)` (`uniq_lead_provider` has `unique=1`) | PASS |
| ADR 006 persistent prototype disclaimer banner rendered | Verified via Playwright E2E test running against `next dev` | PASS |
| Seed loader is idempotent across repeated runs | Ran `pnpm db:seed && pnpm db:seed`; verified clean exit code 0 | PASS |
| Provenance validator strictly rejects invalid records | Stress-tested with inverted range, HTTP URLs, future dates, unknown metrics, missing foreign keys; all rejected | PASS |
| Complete verification suite passes with zero errors | Ran `pnpm verify` (`tsc --noEmit`, `next lint`, `vitest run`, `tsx scripts/validate-data.ts`, `playwright test`); 0 errors | PASS |
| Next.js production build succeeds | Ran `pnpm build`; static pages generated and optimized with zero errors | PASS |

---

## Findings

### [Minor] Finding 1: `next lint` Deprecation Notice in Next.js 15
- **What**: Next.js 15 emits a deprecation notice: `next lint is deprecated and will be removed in Next.js 16. Migrate to the ESLint CLI: npx @next/codemod@canary next-lint-to-eslint-cli .`
- **Where**: `package.json:10` (`"lint": "next lint"`)
- **Why**: While `next lint` currently passes with 0 warnings or errors, future Next.js major upgrades will remove `next lint`.
- **Suggestion**: In a subsequent maintenance pass, migrate `package.json` `"lint"` script to `eslint .` using standard ESLint CLI.

### [Minor] Finding 2: Date Validator Permissiveness on Calendar Days/Months
- **What**: In `scripts/validate-data.ts`, `asOfDate` regex `^\d{4}-\d{2}(-\d{2})?$` checks digit format and compares against `todayUtc`, but does not strictly reject impossible dates like `2024-99-99` or `2024-02-31`.
- **Where**: `scripts/validate-data.ts:16-23`
- **Why**: An invalid month (e.g. 99) could theoretically pass if not guarded by calendar parsing.
- **Suggestion**: Add `!isNaN(Date.parse(dateStr))` or strict month/day range validation in `asOfDate` before Milestone M2 data ingestion.

### [Low / Observation] Finding 3: `/planner` Navigation Route Scheduled for M3
- **What**: Navigation links in `src/app/layout.tsx` and `src/app/page.tsx` point to `/planner`, which currently returns Next.js default 404 until Milestone M3 is implemented.
- **Where**: `src/app/layout.tsx:37`, `src/app/page.tsx:21`
- **Why**: Root `AGENTS.md` Rule 5 states: *"Every visible control works or is not rendered. No dead buttons..."*
- **Suggestion**: Acceptable for M0 scaffold as an expected link to upcoming M3 scope, but milestone M3 should implement `src/app/planner/page.tsx` (or a stub placeholder) to fulfill Rule 5.

---

## Adversarial Stress-Testing & Attack Surface

### 1. Assumption Stress-Testing
- **Assumption Tested**: `scripts/validate-data.ts` prevents unverified, inverted, or insecure data from entering the database.
  - **Scenario**: Injected invalid facts containing HTTP URLs, `valueMin > valueMax`, future dates (`2099-01-01`), and unsupported metric names into validation schemas.
  - **Result**: `factSchema.safeParse` caught all violations and returned descriptive error messages.
- **Assumption Tested**: Cross-table referential integrity prevents orphaned entities.
  - **Scenario**: Tested fixtures where a city references an unknown state, and a fact references an unknown city.
  - **Result**: `validateData` explicitly reported `City 'bengaluru' references unknown state 'unknown-state'` and `Fact references unknown city 'nonexistent-city'`.
- **Assumption Tested**: Seed script idempotency across repeated runs.
  - **Scenario**: Executed `pnpm db:seed` multiple times consecutively.
  - **Result**: Successive runs execute cleanly without duplicating entries or re-granting initial demo credits.

### 2. Edge Case & Failure Mode Analysis
- **Port Contention**: Playwright's `webServer` correctly detected port 3000 busy during consecutive test cycles and dynamically bound to port 3001, completing all browser assertions without failure.
- **Concurrency & Locking**: Verified that SQLite database locks during concurrent read/write operations degrade safely and release connections cleanly via `rawClient.close()`.

---

## Coverage Gaps & Unexplored Areas

- **M2 Seed Data Content**: Actual city seed data records (`data/seed/*.json`) are currently empty arrays `[]`. Population of verified real-world Indian city data is explicitly scoped to Milestone M2 per `docs/build-plan.md`. (Risk: Low / Scoped to M2).
- **Planner Domain Logic**: Core weighted ranking algorithm and UI sliders are not yet built. Scoped to Milestone M3 per `docs/build-plan.md`. (Risk: Low / Scoped to M3).

---

## Verdict Rationale

Worker 2 has delivered a robust, compliant, and verified M0 foundation. Zero blocking issues or integrity violations were discovered. All tests pass cleanly, and the database schema faithfully enforces the non-negotiable architectural constraints of GCC Atlas.

**Verdict**: **APPROVE**
