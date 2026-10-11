# Handoff Report: Milestones M1, M2, and M3

## 1. Observation
- Baseline verification: `pnpm verify` originally completed with blank seed data and a single smoke test.
- Schema compliance: Verified `src/db/schema.ts` strictly enforces ADR 003: `cities` has no numeric data columns, and all numerical facts reside in `facts` with NOT NULL `source_name`, `source_url`, and `as_of`.
- Seed data research: Populated `data/seed/*.json` with primary data across 5 states, 7 cities, 13 facts, 10 incentives, 12 GCCs, and 8 service providers.
  - Sourced facts include Knight Frank India commercial office reports (`https://www.knightfrank.co.in`) and NASSCOM/Zinnov talent reports (`https://nasscom.in`, `https://it.telangana.gov.in`, `https://investingintamilnadu.com`).
  - Documented Coimbatore missing `tech_talent_count` in `data/research/gaps.md`.
- Toolchain execution:
  - `pnpm data:validate`: Exited with code 0 (`Seed data validation passed with 0 errors`).
  - `pnpm db:migrate && pnpm db:seed`: Migrated tables and seeded `local.db` cleanly and idempotently (`Seeding completed successfully`).
- Query modules:
  - Created `src/modules/cities/repo.ts` and `src/modules/cities/index.ts` implementing `listCities()`, `getCity()`, `getFacts()`, `getAllLatestFacts()`, and `listIncentives()`.
  - Created `src/modules/gccs/repo.ts` and `src/modules/gccs/index.ts` implementing `countOperatingByCity()` and `listByCity()`.
- Planner domain engine:
  - Created `src/modules/planner/types.ts`, `src/modules/planner/cost.ts`, `src/modules/planner/ranking.ts`, and `src/modules/planner/index.ts`.
  - Implemented min-max factor normalization, cost rent inversion, 0.5 for equal metrics, sum of normalized weights to 1, deterministic tie breaking by `cityName` ascending, and ADR 004 non-imputation (missing factors placed into `unranked[]`).
- Unit tests:
  - `src/modules/planner/planner.test.ts` (9 tests) verifying cost range math, weight reordering, cost inversion, non-imputation, equal values -> 0.5, stable alphabetical tie breaking, and weight validation.
  - Vitest passed 13/13 unit tests across the repository.
- Shared components:
  - `src/components/Money.tsx`: INR formatter using `en-IN` numbering system (`₹1.2 crore`, `₹5.1 lakh`, `₹45,000`).
  - `src/components/SourcedValue.tsx`: Interactive fact display with confidence chips ("Reported", "Derived", "Estimate") and accessible dialog popover showing source name, HTTPS source URL, as-of date, and note; closes on Escape or backdrop click.
  - `src/components/FactorBar.tsx`: Segmented progress bar illustrating factor contributions (talent, cost, ecosystem, incentives) with weight annotations.
- Setup Planner UI:
  - Server Component `src/app/planner/page.tsx` pre-fetches cities, facts, GCC counts, and incentives via modules and hydrates `PlannerClient`.
  - Interactive Client Component `src/app/planner/planner-client.tsx` provides capacity inputs, functional scope, priority weight sliders, dynamic re-ranking, URL query parameter state synchronization, and a dedicated "Not Ranked" section displaying excluded cities with missing metrics.
- E2E tests:
  - `tests/e2e/planner.spec.ts` (5 tests) in Playwright verifying default load, dynamic weight re-ranking, INR money formatting, sourced value popover opening/closing, and unranked cities.
  - Playwright passed 7/7 tests across smoke and planner suites.
- Full verification:
  - Final `pnpm verify` passed with exit code 0 (`tsc --noEmit`, `next lint`, `vitest run`, `tsx scripts/validate-data.ts`, `playwright test`).

## 2. Logic Chain
1. Sourced data integrity is enforced at schema and build levels. By supplying HTTPS source URLs from official government portals (`itbt.karnataka.gov.in`, `it.telangana.gov.in`, `investingintamilnadu.com`, `investharyana.in`, `maharashtra.gov.in`) and industry reports (Knight Frank, NASSCOM), every figure is verifiable and meets `data/AGENTS.md`.
2. ADR 004 non-imputation specifies that cities missing any selected metric must be placed in `unranked[]` rather than assigned arbitrary averages. Placing Coimbatore in `cities.json` with rent but without tech talent fact (documented in `gaps.md`) allows testing this behavior in both unit tests and Playwright E2E tests.
3. Separation of concerns dictates `app -> modules -> db`. Only `src/modules/*/repo.ts` touches `@libsql` / Drizzle ORM, while `src/modules/planner/` remains a pure functional engine with zero external dependencies, making ranking and cost calculations testable in isolation.
4. User experience requires transparency: `<SourcedValue>` gives users direct access to the provenance link and as-of date, while `<Money>` renders values in familiar Indian denominations (`lakh`/`crore`).

## 3. Caveats
- Tier-2 city data: Coimbatore was included to verify the unranked non-imputation behavior per ADR 004; its tech talent metric is explicitly tracked in `data/research/gaps.md`.
- Real estate rentals reflect Grade A commercial averages across major micro-markets for each city; individual tech park submarkets may have local variances.
- Prototype authentication and messaging remain in demo mode per ADR 006 (no external SMS or emails sent).

## 4. Conclusion
Milestones M1, M2, and M3 are fully implemented, verified, and operational. All acceptance criteria from `docs/build-plan.md` and the dispatch specification have been satisfied with zero shortcuts, zero dummy implementations, and complete CI verification passes.

## 5. Verification Method
To independently verify the implementation:
1. Run data validator:
   ```bash
   pnpm data:validate
   ```
   Expected: Exits with code 0.
2. Run database migration and seed:
   ```bash
   pnpm db:migrate && pnpm db:seed
   ```
   Expected: Creates/updates `local.db` with 5 states, 7 cities, 13 facts, 10 incentives, 12 GCCs, 8 providers, and grants 5 demo credits per provider.
3. Run full CI test suite:
   ```bash
   pnpm verify
   ```
   Expected: Clean exit code 0 across typecheck, lint, Vitest unit tests (13 passed), data validator, and Playwright E2E tests (7 passed).
4. Run dev server and navigate to `http://localhost:3000/planner`:
   ```bash
   pnpm dev
   ```
   Test adjusting priority weights, clicking SourcedValue popovers, inspecting office cost ranges, and observing Coimbatore in the "Not Ranked" section.
