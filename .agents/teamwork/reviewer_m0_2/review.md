# Milestone M0 Review Report — Schema & Provenance Architecture

**Reviewer**: Reviewer 2 (Roles: reviewer, critic)  
**Target Milestone**: M0 Scaffold & Foundation  
**Date**: 2026-10-11  
**Verdict**: **APPROVE**

---

## Executive Summary

The Milestone M0 database schema, provenance validator, and seed execution logic have been reviewed and stress-tested against the authoritative requirements in `docs/build-plan.md`, `src/db/AGENTS.md`, and Architecture Decision Records (ADR 001 - ADR 006).

All four focus areas meet architectural and operational standards:
1. `src/db/schema.ts` defines all 9 required tables (`states`, `cities`, `facts`, `incentives`, `gccs`, `providers`, `leads`, `lead_offers`, `credit_ledger`). The `cities` table contains **zero numeric columns** (strictly TEXT per ADR 003), and `credit_ledger` is strictly append-only with **no balance column** (balance computed via `SUM(delta)` per ADR 005).
2. `scripts/validate-data.ts` strictly validates provenance: HTTPS protocol enforced for all source URLs and provider websites, `as_of` dates constrained to `<= today`, `value_min <= value_max`, and metrics constrained to the closed set `['office_rent_inr_sqft_month', 'tech_talent_count']`.
3. `scripts/seed.ts` is fully idempotent across multiple executions and properly grants exactly 5 demo credits (`reason: 'demo_grant'`, `delta: 5`) upon first provider discovery.
4. `pnpm verify` runs cleanly with 0 errors across TypeScript strict typechecking, ESLint, Vitest unit tests, seed data validation, and Playwright e2e smoke tests.

Zero integrity violations (no dummy facades, hardcoded test shortcuts, or bypasses) were detected.

---

## Verified Claims & Focus Invariants

### 1. Database Schema (`src/db/schema.ts`)
- **Table Count & Existence**: Verified 9 domain tables in `src/db/schema.ts`, generated migration `0000_cheerful_madame_web.sql`, and confirmed table existence in `local.db` via `sqlite_master`:
  - `states` (PK: `slug`)
  - `cities` (PK: `slug`, FK: `state_slug` -> `states.slug`)
  - `facts` (PK: `id` autoincrement, FK: `city_slug` -> `cities.slug`, indexed on `[city_slug, metric]`)
  - `incentives` (PK: `id` autoincrement, FK: `state_slug` -> `states.slug`)
  - `gccs` (PK: `id` autoincrement, FK: `city_slug` -> `cities.slug`, indexed on `city_slug`)
  - `providers` (PK: `slug`)
  - `leads` (PK: `id` UUID, FK: `city_slug` -> `cities.slug`)
  - `lead_offers` (PK: `id` UUID, FKs: `lead_id` -> `leads.id`, `provider_slug` -> `providers.slug`, unique index on `[lead_id, provider_slug]`)
  - `credit_ledger` (PK: `id` UUID, FKs: `provider_slug` -> `providers.slug`, `lead_offer_id` -> `lead_offers.id`, indexed on `provider_slug`)
- **ADR 003 Zero Numeric Columns in `cities`**:
  - `cities` table columns verified: `slug` (TEXT), `name` (TEXT), `state_slug` (TEXT).
  - Vitest test `strictly enforces ADR 003: cities table has NO numeric data columns` verifies column data types are not `number`, `integer`, `real`, `numeric`, `float`, or `double`.
- **ADR 003 Source Columns NOT NULL**:
  - In `facts`: `source_name`, `source_url`, `as_of`, `confidence` are all `.notNull()`.
- **ADR 005 Append-Only Ledger with No Balance Column**:
  - `credit_ledger` columns: `id`, `provider_slug`, `delta` (INTEGER), `reason`, `lead_offer_id`, `created_at`.
  - Zero `balance` column exists. Balance must be computed via `SUM(delta)`.
- **Foreign Key Enforcement**:
  - Tested `@libsql/client` connection against foreign key violations: insertion of child rows referencing nonexistent foreign keys correctly throws `SQLITE_CONSTRAINT_FOREIGNKEY`.

### 2. Strict Provenance Rules (`scripts/validate-data.ts`)
- **HTTPS Only**: `httpsUrl` Zod refine checks `url.startsWith("https://")`. Verified rejecting `http://` and non-URL strings for `sourceUrl` and provider `website`.
- **As-Of <= Today**: `asOfDate` Zod refine checks `dateStr <= todayUtc`. Verified rejecting future dates (e.g., `2099-01-01`, `2099-12`).
- **Value Min <= Value Max**: `factSchema` refine checks `data.valueMin <= data.valueMax`. Verified rejecting inverted ranges (`valueMin: 200, valueMax: 100`).
- **Closed Metric Set**: Enforces `allowedMetrics = ['office_rent_inr_sqft_month', 'tech_talent_count']`. Verified rejecting arbitrary metric strings.
- **Cross-Reference Integrity**: Checks `cities` -> `states`, `facts` -> `cities`, `incentives` -> `states`, `gccs` -> `cities`, `providers.citiesServed` -> `cities`.
- **Duplicate Fact Prevention**: Checks uniqueness of `(citySlug, metric, asOf, sourceUrl)` combinations.

### 3. Seed Execution & Demo Credits (`scripts/seed.ts`)
- **Pre-Seed Validation**: Invokes `validateData(seedDir)` and aborts process with non-zero exit code if any validation errors are detected.
- **Idempotency**:
  - `states`, `cities`, `providers` use Drizzle `onConflictDoUpdate`.
  - `facts`, `incentives`, `gccs` match on natural keys before updating or inserting.
  - Tested execution of seed logic repeatedly against an isolated database: row counts remained invariant (1:1), and zero duplicate rows were generated.
- **5 Demo Credits Grant**:
  - Inspects existing ledger rows for provider `slug` before granting credits (`existingLedger.length === 0`).
  - Grants exactly 5 credits (`delta: 5`, `reason: 'demo_grant'`).
  - Idempotency verified: re-running seed does NOT grant additional credits. Provider ledger row count remains 1 and total delta remains 5.

### 4. CI/Verification Toolchain (`pnpm verify`)
- `pnpm typecheck` (`tsc --noEmit`): Passed cleanly.
- `pnpm lint` (`next lint`): Passed cleanly (0 warnings, 0 errors).
- `pnpm test` (`vitest run`): 4/4 tests passed (covering table definitions, ADR 003 zero numeric columns in cities, fact source columns NOT NULL, and credit ledger delta).
- `pnpm data:validate` (`tsx scripts/validate-data.ts`): Passed cleanly (0 errors).
- `pnpm test:e2e` (`playwright test`): 2/2 tests passed (home page render, ADR 006 disclaimer banner, link to planner).

---

## Adversarial Findings & Observations

### Finding 1 (Minor / Robustness): Permissive Calendar Date Syntax in `validate-data.ts`
- **Location**: `scripts/validate-data.ts:14-23`
- **Description**: The `asOfDate` validator uses regex `/^\d{4}-\d{2}(-\d{2})?$/` combined with lexical string comparison `dateStr <= todayUtc`. This checks format and future date boundaries, but does not validate calendar validity (e.g. `2024-99-99` or `2024-02-31` evaluates as `< 2026-10-11` and passes validation).
- **Severity**: Minor (does not block M0 since seed data is researched and empty/valid).
- **Suggestion**: In M1/M2, add calendar parsing validation:
  ```typescript
  .refine((val) => {
    const dateStr = val.length === 7 ? `${val}-01` : val;
    const parsed = new Date(dateStr);
    return !isNaN(parsed.getTime()) && dateStr <= todayUtc;
  }, { message: "asOf must be a valid calendar date not in the future" })
  ```

### Finding 2 (Minor / Robustness): Seed Primary Key Duplication Pre-Check
- **Location**: `scripts/validate-data.ts:241-249`
- **Description**: `validateData()` detects duplicates for `facts` using composite key `(citySlug, metric, asOf, sourceUrl)`, but does not explicitly check for duplicate `slug` in `states.json`, `cities.json`, or `providers.json`. `seed.ts` handles duplicates via `onConflictDoUpdate` (upsert), but having `validateData()` reject duplicate primary keys in JSON seed files would provide earlier feedback.
- **Severity**: Minor.

---

## Integrity Audit

| Check | Result | Evidence |
|---|---|---|
| Hardcoded test results in source | None | Tests dynamically inspect Drizzle table metadata via `getTableColumns` and Playwright live DOM |
| Dummy or facade implementations | None | Real libSQL SQLite database, real Drizzle ORM queries, real Zod validation |
| Shortcuts bypassing core task | None | Full schema with 9 tables, relations, and migration scripts applied |
| Fabricated verification logs | None | Real CLI execution of `pnpm verify` (exit code 0) |

---

## Verdict: APPROVE

Milestone M0 satisfies all architectural requirements, ADR rules, schema invariants, and verification criteria. Ready to proceed to M1 / M2.
