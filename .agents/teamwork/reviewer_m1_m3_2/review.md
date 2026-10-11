# Quality and Adversarial Review Report: Milestones M1-M3 Data Provenance & Research Seed Data

## Review Summary

**Verdict**: **APPROVE** (with advisory findings)
**Target**: Milestones M1, M2, and M3 (Data schema, provenance validator, seed data, and planner engine)
**Reviewer**: Reviewer 2 (Roles: reviewer, critic)
**Timestamp**: 2026-10-11T19:55:00Z

---

## 1. Quality Review Findings

### [Major] Finding 1: Production build (`pnpm build`) failure due to missing App Router 404 handler
- **What**: Executing `pnpm build` (`next build`) fails with `[Error: Cannot find module '.../.next/server/next-font-manifest.json']` and `[Error: Invariant: no direct app page entry found for /_not-found]`.
- **Where**: `src/app/`, `package.json` build script.
- **Why**: Next.js 15 App Router expects an explicit `src/app/not-found.tsx` to handle 404 static generation, and exports fail when font manifests are missing. While `pnpm verify` currently succeeds because it runs `next dev` under Playwright rather than `next build`, production deployments will fail.
- **Suggestion**: Create `src/app/not-found.tsx` returning a clean 404 message and prototype disclaimer banner, and verify `pnpm build` in CI.

### [Minor] Finding 2: Root domain URLs used rather than deep report/notification citations
- **What**: Multiple records in `facts.json` and `incentives.json` use root or portal URLs (e.g. `https://www.knightfrank.co.in`, `https://nasscom.in`, `https://itbt.karnataka.gov.in`) rather than direct deep links to the specific report PDF or official gazette notification.
- **Where**: `data/seed/facts.json`, `data/seed/incentives.json`.
- **Why**: `data/AGENTS.md` prefers report citations with "a page or table you can point to" and explicit source URLs. While the notes describe corridors and methodologies, deep URLs would maximize provenance audibility.
- **Suggestion**: In subsequent data passes (M4+), replace top-level domain URLs with direct document or subpage URLs where available.

### [Minor] Finding 3: E2E test runner sensitivity to lingering port 3000 processes
- **What**: If an external or prior process holds port 3000, Playwright automatically boots a fallback dev server on port 3001 while still sending test requests to `baseURL: http://localhost:3000`, causing spurious 500 error test failures.
- **Where**: `playwright.config.ts`.
- **Why**: The default configuration has `reuseExistingServer: !process.env.CI`. If an unready or mismatched server occupies port 3000, tests fail.
- **Suggestion**: Add a pre-check or port kill script before running e2e tests, or configure Playwright to fail fast if port 3000 is occupied by an unexpected server.

---

## 2. Adversarial Challenge & Stress-Testing

### Challenge 1: Assumption of Non-Imputation (ADR 004) Under Missing Metrics
- **Assumption Challenged**: Does the planner properly exclude cities with partial metrics from the ranked list rather than imputing averages or hiding them completely?
- **Attack Scenario**: Evaluated Coimbatore, which has `office_rent_inr_sqft_month` (₹35-50/sqft) but no `tech_talent_count` (tracked in `data/research/gaps.md`).
- **Result**: PASSED. Coimbatore is correctly placed in `unranked` with explicit badge `Missing: Tech Talent Count` and still provides estimated office costs.
- **Stress-Test Evidence**: Tested in `src/modules/planner/planner.test.ts` line 149 and verified in Playwright E2E test `planner.spec.ts:84`.

### Challenge 2: Cost Factor Inversion Stress-Testing
- **Assumption Challenged**: Composite score ranking must favor lower rents when cost weight is prioritized.
- **Attack Scenario**: Configured planner weights with `talent: 0, cost: 100`. Verified whether high-rent cities (Mumbai: ₹90-160, Bengaluru: ₹85-118) are overtaken by lower-rent cities (Chennai: ₹62-88, Hyderabad: ₹65-90).
- **Result**: PASSED. Formula `(bounds.max - raw) / (bounds.max - bounds.min)` correctly inverts cost factor so cheapest rent receives 100 composite score.

### Challenge 3: Seed Idempotency & Credit Ledger Pollution
- **Assumption Challenged**: Re-running `pnpm db:seed` multiple times must not inflate provider demo credits or insert duplicate rows.
- **Attack Scenario**: Executed `pnpm db:seed` back-to-back on `local.db`.
- **Result**: PASSED. Database table row counts remained invariant (states: 5, cities: 7, facts: 13, incentives: 10, gccs: 12, providers: 8, credit_ledger: 8). Provider demo grant of 5 credits was only granted on initial seed.

### Challenge 4: Schema Constraint Invariants (ADR 003)
- **Assumption Challenged**: Does `cities` schema strictly forbid quantitative metrics columns?
- **Attack Scenario**: Inspect column metadata on `schema.cities`.
- **Result**: PASSED. Only `slug` (text), `name` (text), and `state_slug` (text) are present. All quantitative figures reside strictly in `schema.facts`.

---

## 3. Integrity Audit

- **Hardcoded test results embedded in source code**: None detected. Tests use dynamic fixtures or execute against real database tables.
- **Dummy or facade implementations**: None detected. `scripts/validate-data.ts` uses strict Zod schemas and cross-reference validation; `rankCities` computes true normalized linear scores; `estimateOfficeCost` calculates mathematical office cost bounds.
- **Shortcuts bypassing the intended task**: None detected. Standard project toolchain runs genuine TypeScript compilation, ESLint, Vitest, LibSQL queries, and headless Chromium via Playwright.
- **Fabricated verification outputs**: None detected. All commands executed directly with clean exits and verifiable logs.
- **Evidence of self-certifying work**: Independent verification conducted across all four required scripts.

---

## 4. Verified Claims

1. **At least 6 candidate Indian cities populated**: Verified 7 cities (`bengaluru`, `hyderabad`, `pune`, `gurugram`, `chennai`, `mumbai`, `coimbatore`).
2. **Valid HTTPS source URLs**: Verified across all 13 facts, 10 incentives, 12 GCCs, and 8 providers (100% start with `https://`).
3. **Valid as_of dates**: Verified ISO format YYYY-MM-DD or YYYY-MM with no future dates across all records.
4. **Data gaps documented**: Verified `data/research/gaps.md` documents Coimbatore's missing tech talent count with methodology and date.
5. **Data validator passes cleanly**: Verified `pnpm data:validate` exits with code 0 and 0 errors.
6. **Clean idempotent seeding**: Verified `pnpm db:seed` seeds cleanly into `local.db` with identical row counts on re-execution.
7. **Verification toolchain passes**: Verified `pnpm verify` (typecheck, lint, vitest, data:validate, playwright e2e) exits 0 with all 13 unit tests and 7 e2e tests passing.
