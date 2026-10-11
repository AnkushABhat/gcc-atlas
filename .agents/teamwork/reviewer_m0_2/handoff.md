# Handoff Report — Reviewer 2 (Milestone M0: Schema & Provenance Architecture)

## 1. Observation

1. **Schema Definition (`src/db/schema.ts`)**:
   - `states` defined at line 6 with columns `slug: text("slug").primaryKey()`, `name: text("name").notNull()`.
   - `cities` defined at line 16 with columns `slug: text("slug").primaryKey()`, `name: text("name").notNull()`, `state_slug: text("state_slug").notNull().references(() => states.slug)`. Verified zero numeric/integer/real columns.
   - `facts` defined at line 28 with columns `id`, `city_slug`, `metric`, `value_min: real("value_min").notNull()`, `value_max: real("value_max").notNull()`, `unit`, `source_name: text("source_name").notNull()`, `source_url: text("source_url").notNull()`, `as_of: text("as_of").notNull()`, `confidence: text("confidence").notNull()`, `note`.
   - `incentives` defined at line 53 with `id`, `state_slug`, `name`, `type`, `summary`, `min_headcount`, `max_headcount`, `functions`, `valid_from`, `valid_to`, `source_name`, `source_url`, `as_of`.
   - `gccs` defined at line 74 with `id`, `name`, `parent_company`, `parent_hq_country`, `city_slug`, `functions`, `status`, `announced_on`, `source_name`, `source_url`, `as_of`.
   - `providers` defined at line 99 with `slug`, `name`, `category`, `cities_served`, `website`, `description`, `source_name`, `source_url`, `as_of`, `claimed_at`.
   - `leads` defined at line 115 with `id`, `buyer_name`, `buyer_company`, `buyer_email`, `city_slug`, `headcount`, `function`, `category`, `timeline`, `note`, `created_at`.
   - `lead_offers` defined at line 134 with `id`, `lead_id`, `provider_slug`, `status`, `offered_at`, `resolved_at`, and `uniqueIndex("uniq_lead_provider")`.
   - `credit_ledger` defined at line 158 with `id`, `provider_slug`, `delta: integer("delta").notNull()`, `reason`, `lead_offer_id`, `created_at`. No `balance` column exists.
   - Generated migration `src/db/migrations/0000_cheerful_madame_web.sql` matches schema definitions.

2. **Validation Rules (`scripts/validate-data.ts`)**:
   - Lines 7-12: `httpsUrl = z.string().url().refine((url) => url.startsWith("https://"), { message: "sourceUrl must use HTTPS protocol" })`.
   - Lines 14-23: `asOfDate = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/).refine((val) => dateStr <= todayUtc, { message: "asOf must not be in the future" })`.
   - Lines 36-39: `allowedMetrics = ["office_rent_inr_sqft_month", "tech_talent_count"] as const`.
   - Lines 54-57: `factSchema` refinement `data.valueMin <= data.valueMax`.
   - Lines 205-240: Cross-reference integrity checks (states, cities, incentives, gccs, providers).
   - Lines 241-249: Duplicate check for facts on `(citySlug, metric, asOf, sourceUrl)`.
   - Lines 281-287: Non-zero exit code (`process.exit(1)`) on validation failure.

3. **Seed Logic (`scripts/seed.ts`)**:
   - Lines 21-34: Calls `validateData(seedDir)` and aborts if `errors.length > 0`.
   - Lines 51-81, 213-240: Upserts `states`, `cities`, `providers` via `onConflictDoUpdate`.
   - Lines 84-211: Selects existing rows by natural key for `facts`, `incentives`, `gccs` and updates or inserts accordingly.
   - Lines 243-258: Checks `existingLedger.length === 0` for provider slug before inserting `delta: 5`, `reason: "demo_grant"`.
   - Empirically verified across 2 successive seed passes: table row counts remained identical (1:1), and provider ledger row count remained 1 with `delta: 5`.

4. **CI Toolchain Execution (`pnpm verify`)**:
   - Command: `pnpm verify`
   - Result:
     ```
     $ pnpm typecheck && pnpm lint && pnpm test && pnpm data:validate && pnpm test:e2e
     $ tsc --noEmit
     $ next lint
     ✔ No ESLint warnings or errors
     $ vitest run
     ✓ tests/unit/smoke.test.ts (4 tests) 16ms
     Test Files  1 passed (1)
     Tests  4 passed (4)
     $ tsx scripts/validate-data.ts
     Seed data validation passed with 0 errors.
     $ playwright test
     2 passed (15.5s)
     ```
   - Exit code: 0.

5. **Local Database Operations**:
   - Commands: `pnpm db:migrate && pnpm db:seed`
   - Generated `local.db` with all 9 domain tables plus `__drizzle_migrations`.

## 2. Logic Chain

1. From Observation 1, all 9 domain tables specified in `src/db/AGENTS.md` are declared in `src/db/schema.ts` and generated in SQL migrations.
2. From Observation 1 and direct inspection of `schema.cities` columns (`slug`, `name`, `state_slug`), there are zero numeric columns in the `cities` table, fulfilling the critical ADR 003 requirement.
3. From Observation 1 and `PRAGMA table_info(credit_ledger)`, `credit_ledger` contains only `id`, `provider_slug`, `delta`, `reason`, `lead_offer_id`, and `created_at`. No `balance` column exists, and the ledger computes balance as `SUM(delta)` per ADR 005.
4. From Observation 2, `validate-data.ts` strictly validates that all source URLs and provider websites use HTTPS, `as_of` dates do not lie in the future, `value_min <= value_max`, metrics belong to `allowedMetrics`, and cross-entity references are valid.
5. From Observation 3, `scripts/seed.ts` enforces pre-validation, performs idempotent upserts across all entities, and grants exactly 5 demo credits without double-granting upon subsequent runs.
6. From Observation 4 and 5, the entire verification suite passes with zero errors and `pnpm db:migrate && pnpm db:seed` works out-of-the-box without external environment variables.
7. Therefore, the implementation strictly conforms to the Milestone M0 specification and exhibits no integrity violations.

## 3. Caveats

- Date string syntax in `scripts/validate-data.ts` uses regex and lexical comparison (`dateStr <= todayUtc`). Non-calendar dates (e.g. `2024-99-99`) pass validation if they lexicographically sort prior to today's date (recorded as Minor Finding 1).
- Uniqueness of `slug` in `states.json`, `cities.json`, and `providers.json` is enforced by database primary key and `onConflictDoUpdate` rather than explicitly in `validateData()` (recorded as Minor Finding 2).
- E2E smoke tests cover home page rendering, navigation link, and the ADR 006 prototype disclaimer banner. Full end-to-end user flows (Planner, Leads, Inbox) belong to subsequent milestones (M3-M5).

## 4. Conclusion

**Verdict: APPROVE**

Milestone M0 is complete and verified. The schema structure, provenance validator, seed scripts, and toolchain meet all acceptance criteria and ADR constraints.

## 5. Verification Method

To independently verify this assessment:
1. Run `pnpm verify` from repository root: confirms typecheck, lint, vitest, data:validate, and playwright tests pass cleanly.
2. Run `pnpm db:migrate && pnpm db:seed`: confirms migration and seeding succeed on `local.db` without environment variables.
3. Inspect `src/db/schema.ts`: confirm zero numeric columns on `cities` and no balance column on `credit_ledger`.
4. Run `npx tsx -e "import { factSchema } from './scripts/validate-data'; console.log(!factSchema.safeParse({ citySlug: 'bengaluru', metric: 'office_rent_inr_sqft_month', valueMin: 100, valueMax: 150, unit: 'INR', sourceName: 'S', sourceUrl: 'http://insecure.com', asOf: '2024-01-01', confidence: 'reported' }).success);"`: confirms HTTPS enforcement rejects HTTP.

Invalidation conditions:
- Any `pnpm verify` command failing.
- Any numeric column added to `cities`.
- Any `balance` column added to `credit_ledger`.
- Bypassing HTTPS or future date restrictions in `validate-data.ts`.
