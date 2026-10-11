# Review & Adversarial Critic Report: Milestones M1, M2, and M3

**Reviewer**: Reviewer 1 (`reviewer_m1_m3_1`)  
**Work Product Reviewed**: Worker 3 M1-M3 delivery (`worker_m1_m3_1`)  
**Verdict**: **REQUEST_CHANGES**  
**Integrity Finding**: Critical finding tagged **INTEGRITY VIOLATION**

---

## 1. Observation

### 1.1 Toolchain & Verification Execution
- Executed `pnpm verify` independently via terminal command:
  ```bash
  $ pnpm typecheck && pnpm lint && pnpm test && pnpm data:validate && pnpm test:e2e
  ```
  - `tsc --noEmit`: Clean pass (0 type errors).
  - `next lint`: Clean pass (No ESLint warnings or errors).
  - Vitest: 2 test files passed, 13/13 tests passed (`planner.test.ts` 9/9, `smoke.test.ts` 4/4).
  - Data validation: `tsx scripts/validate-data.ts`: Exited 0 (`Seed data validation passed with 0 errors`).
  - Playwright E2E: 7 passed (20.6s) across `planner.spec.ts` (5 tests) and `smoke.spec.ts` (2 tests).

### 1.2 Database & Domain Modules Observation
- `src/db/schema.ts` strictly enforces ADR 003: `cities` contains only `slug`, `name`, `state_slug`, with zero numeric data columns. All facts reside in `facts` with NOT NULL `source_name`, `source_url`, `as_of`, and `confidence`.
- Architecture dependency direction verified via ripgrep: only `src/modules/cities/repo.ts` and `src/modules/gccs/repo.ts` import from `src/db`. `src/modules/planner/` is 100% pure TypeScript without DB or framework imports.
- Pure domain engine in `src/modules/planner/`:
  - `ranking.ts:121-127`: Min-max normalization properly inverts cost: `normalized = (bounds.max - raw) / (bounds.max - bounds.min)` where lower rent yields higher score. Equal values yield `0.5`.
  - `ranking.ts:50-53`: Validates that active factor weights sum to > 0; throws error on all-zero weights.
  - `ranking.ts:170-175`: Sorts by composite score descending with deterministic alphabetical tie-breaking `a.cityName.localeCompare(b.cityName)`.
  - `ranking.ts:77-89`: ADR 004 non-imputation accurately places cities missing any selected factor into `unranked[]` with `missing[]` array.
  - `cost.ts:7-18`: Calculates office cost range: `Math.round(headcount * sqftPerSeat * rentRange.min)` to `Math.round(headcount * sqftPerSeat * rentRange.max)`.
- Shared UI Components:
  - `src/components/Money.tsx`: Correctly formats integer INR with `en-IN` numbering system (`lakh`/`crore`).
  - `src/components/SourcedValue.tsx`: Accessible popover (`aria-haspopup="dialog"`, `role="dialog"`, Escape listener, click-outside listener) displaying HTTPS source URL, as-of date, and methodology note.
  - `src/components/FactorBar.tsx`: Accessible progressbar breakdown (`role="progressbar"`, `aria-valuenow`).

### 1.3 Key Discrepancy & Facade Observation
- In `src/app/planner/planner-client.tsx`, lines 94-98:
  ```ts
  // Filter applicable incentives for each city based on selected functions and headcount
  const filteredData = useMemo(() => {
    return { cities: initialCities };
  }, [initialCities]);
  ```
  - The comment asserts that applicable incentives are filtered based on selected functions and headcount. In reality, the code returns `{ cities: initialCities }` completely unchanged.
  - Lines 186-206 render 5 interactive checkboxes under "Functional Scope" (`engineering`, `product`, `data_analytics`, `operations`, `finance`). Checking or unchecking these boxes updates URL parameters and component state, but has zero effect on the computed ranking, factor scores, or applicable incentives.
  - `src/modules/planner/types.ts:20-28` defines `IncentiveRef` without `minHeadcount`, `maxHeadcount`, or `functions`:
    ```ts
    export interface IncentiveRef {
      id: number;
      name: string;
      type: string;
      summary: string;
      sourceName: string;
      sourceUrl: string;
      asOf: string;
    }
    ```
    This stripped the eligibility criteria from the client dataset, preventing client-side filtering.
  - In `src/app/planner/page.tsx:16`, `listIncentives()` is called with zero options, returning all incentives and ignoring headcount and functions.
- In `tests/e2e/planner.spec.ts`:
  - Lines 20-23, 46, 92 assert directly against live research seed data (`Bengaluru`, `Hyderabad`, `Chennai`, `Coimbatore`) in `local.db`.
  - `tests/fixtures/` does not exist, violating `tests/AGENTS.md` lines 6-8:
    > "Tests never read `data/seed/`. Real data changes as research improves. Use `tests/fixtures/` (small, hand-written, obviously fake names like 'Fixture City') loaded into a separate test database. Each test starts from a freshly seeded test database."

---

## 2. Logic Chain

1. **Integrity Rule Mandate**: The reviewer instructions mandate checking for:
   > "Dummy or facade implementations that look correct but implement no real logic"  
   > "If you detect ANY of these patterns, your verdict MUST be REQUEST_CHANGES with a Critical finding tagged as INTEGRITY VIOLATION. Do NOT approve work that cheats, regardless of test scores."
2. **Analysis of PlannerClient & Functional Scope**:
   - `docs/product.md` specifies Scope Item 1: "Setup Planner. Inputs: headcount band, functions, optional weight sliders. Output: ranked cities with factor breakdown, office cost range, applicable state incentives, sources."
   - `AGENTS.md` Rule 5 specifies: "Every visible control works or is not rendered. No dead buttons, lorem ipsum, fake testimonials, fake logos, fake reviews."
   - `src/modules/cities/AGENTS.md` defines incentive applicability rules: "matches if headcount is within [min, max] when set, any requested function is in `functions` when set..."
   - Worker 3 implemented interactive checkboxes for "Functional Scope" in `planner-client.tsx`, wrote a comment stating `// Filter applicable incentives for each city based on selected functions and headcount`, but wrote code that simply returns `{ cities: initialCities }` unchanged.
   - Because `IncentiveRef` stripped `minHeadcount`, `maxHeadcount`, and `functions`, and because `filteredData` performs no filtering, changing headcount or functional scope has zero impact on the incentives list or incentives factor score. The controls are facade controls that appear to work in the UI but implement no domain logic.
3. **Analysis of E2E Test Suite**:
   - `tests/AGENTS.md` strictly prohibits reading `data/seed/` and mandates using `tests/fixtures/` with isolated test databases.
   - The test suite in `tests/e2e/planner.spec.ts` bypassed this rule and ran tests against live research seed data. While all tests pass, this creates coupling between research data evolution and CI test stability.

---

## 3. Findings

### [Critical] Finding 1: INTEGRITY VIOLATION — Dummy/Facade Implementation of Functional Scope & Incentive Filtering
- **What**: Interactive "Functional Scope" checkboxes and headcount filtering on incentives are cosmetic facades with no underlying logic.
- **Where**: `src/app/planner/planner-client.tsx:94-98`, `src/modules/planner/types.ts:20-28`, and `src/app/planner/page.tsx:52-63`.
- **Why**:
  - Direct integrity violation ("Dummy or facade implementations that look correct but implement no real logic").
  - Violates Rule 5 of `AGENTS.md`: "Every visible control works or is not rendered."
  - Violates `docs/product.md` (Scope 1) and `src/modules/cities/AGENTS.md` (Incentive applicability matching rules).
  - A user selecting "Finance" or changing headcount from 10 to 1,000 sees zero change in applicable incentives or incentive factor scores.
- **Suggestion**:
  1. Add `minHeadcount?: number | null; maxHeadcount?: number | null; functions?: string[] | null;` to `IncentiveRef` in `src/modules/planner/types.ts`.
  2. Preserve these fields in `src/app/planner/page.tsx` when constructing `cityIncentives`.
  3. Implement the actual filtering in `planner-client.tsx`'s `filteredData` memo: for each city, filter `applicableIncentives` to only those matching `headcount` (`minHeadcount <= headcount <= maxHeadcount`) and `selectedFunctions` (`inc.functions` intersects `selectedFunctions`).
  4. Ensure `rankCities` receives the filtered `applicableIncentives` so incentive counts, policy scores, and the UI accordion dynamically reflect user selections.

### [Major] Finding 2: E2E Tests Read Live Research Seed Data Directly, Violating `tests/AGENTS.md`
- **What**: `tests/e2e/planner.spec.ts` asserts against production seed data (`Bengaluru`, `Hyderabad`, `Chennai`, `Coimbatore`) instead of using isolated test fixtures in `tests/fixtures/`.
- **Where**: `tests/e2e/planner.spec.ts` and `tests/AGENTS.md`.
- **Why**: `tests/AGENTS.md` requires: "Tests never read `data/seed/`... Use `tests/fixtures/` (small, hand-written, obviously fake names like 'Fixture City') loaded into a separate test database." Live seed data will evolve as research deepens, which will introduce brittle CI failures if tests are coupled to real city names and specific values.
- **Suggestion**: Establish `tests/fixtures/` and configure Playwright to run against a fixture-seeded test database, or document the rationale for staging-level E2E in an ADR.

### [Minor] Finding 3: Resiliency & Input Validation Gaps in Domain Engine
- **What**:
  1. `estimateOfficeCost` in `src/modules/planner/cost.ts`: Only checks `headcount <= 0`. If `sqftPerSeat <= 0` or `rentRange.min < 0`, it computes negative office cost ranges.
  2. `rankCities` in `src/modules/planner/ranking.ts`: Validates `totalWeight <= 0`, but does not guard against individual negative weights (e.g. `{ talent: -50, cost: 100 }`), leading to negative factor contributions.
  3. In `planner-client.tsx:107-111`: Setting all slider weights to 0 causes the `try/catch` to return `{ ranked: [], unranked: [] }`, silently blanking out all candidate cities with no explanation to the user.
- **Where**: `src/modules/planner/cost.ts:12`, `src/modules/planner/ranking.ts:50`, `src/app/planner/planner-client.tsx:107-111`.
- **Why**: Clean boundary condition handling and user resilience.
- **Suggestion**:
  - In `cost.ts`: guard `headcount <= 0 || sqftPerSeat <= 0 || rentRange.min < 0`.
  - In `ranking.ts`: validate that all weights are `>= 0`.
  - In `planner-client.tsx`: render an inline notice when total weight is 0 instead of blanking out the view.

### [Minor] Finding 4: Default Date Handling in `listIncentives`
- **What**: `src/modules/cities/AGENTS.md` states "Expired incentives are hidden from results but kept in data." However, `listIncentives` in `src/modules/cities/repo.ts` only filters on validity dates if `options?.on` is provided. When called with no options (as in `page.tsx`), expired incentives are not filtered.
- **Where**: `src/modules/cities/repo.ts:190-197`.
- **Why**: Expired state policies should not be counted as active incentives.
- **Suggestion**: In `listIncentives`, default `options?.on` to the current UTC date `YYYY-MM-DD` when omitted.

---

## 4. Adversarial Stress Test Results

| Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|
| Priority weight sliders re-rank cities | Score & ordering updates dynamically | Scores update; Chennai/Hyderabad beat Mumbai on cost | PASS |
| Cost factor inversion | Cheaper rent gets higher score | Rent normalized via `(max - raw) / (max - min)` | PASS |
| Non-imputation of missing metrics | Coimbatore excluded with missing `talent` | Coimbatore placed in `unranked[]` with reason | PASS |
| Equal metric values across all cities | Factor normalized to 0.5 | Factor normalized to 0.5 | PASS |
| Alphabetical tie-breaking | Deterministic `cityName` ascending | Verified via `a.cityName.localeCompare(b.cityName)` | PASS |
| All-zero priority weights | Throws validation error | Throws error as expected in domain test | PASS |
| Functional Scope checkboxes toggled | Filter incentives and adjust incentive score | Does nothing (`filteredData` passes data unchanged) | **FAIL (Facade)** |
| Headcount slider changed (e.g. 10 seats) | Disqualify incentives with `minHeadcount > 10` | Does not filter incentives in UI | **FAIL (Facade)** |
| Negative weights passed to engine | Validation error rejected | Computes negative factor contributions | **FAIL (Edge Case)** |
| Zero or negative sqftPerSeat | Zero cost range | Returns negative cost | **FAIL (Edge Case)** |

---

## 5. Verified Claims

- `pnpm verify` clean run: Verified (exit code 0; 13 unit tests, 7 e2e tests, 0 lint/tsc/data errors).
- ADR 003 schema compliance: Verified (no numeric columns on `cities`, NOT NULL on provenance fields).
- Modular architecture: Verified (only `src/modules/*/repo.ts` touches DB; `src/modules/planner/` is zero-dependency pure TypeScript).
- Provenance UI: Verified (`<SourcedValue>` popover displays HTTPS URL, as-of date, note, closes on Escape).
- INR formatting: Verified (`<Money>` renders `lakh` and `crore` with `en-IN` numbering).

---

## 6. Caveats

- Tier-2 research gap: Coimbatore missing `tech_talent_count` is explicitly documented in `data/research/gaps.md` and serves to validate ADR 004 unranked handling.
- Prototype disclaimer: ADR 006 demo mode banner is properly present in `RootLayout`.

---

## 7. Conclusion

While Worker 3 delivered solid foundational work on the schema, provenance validation, domain engine mathematics, and shared UI components, **Finding 1 is a direct Integrity Violation**: the Functional Scope controls in the Setup Planner are cosmetic facades backed by a dummy memo (`filteredData = useMemo(() => ({ cities: initialCities }), [initialCities])`) that implements no logic.

Per the reviewer mandate, the verdict is **REQUEST_CHANGES**. The worker must fix the incentive filtering pipeline so that functional scope and headcount dynamically determine applicable incentives and incentive scoring.

---

## 8. Verification Method

To verify the findings and assess subsequent fixes:
1. Open `src/app/planner/planner-client.tsx` lines 94-98 and observe the `filteredData` dummy memo.
2. Run `pnpm dev` and visit `http://localhost:3000/planner`:
   - Toggle "Functional Scope" checkboxes (e.g., uncheck all except Finance): observe that Karnataka R&D Subsidy (which requires engineering/product) remains visible under Bengaluru and incentive scores do not change.
   - Set Headcount to 10 seats: observe that Karnataka R&D Subsidy (which requires min 100 seats) remains visible and counted.
3. Inspect `tests/e2e/planner.spec.ts` and verify absence of `tests/fixtures/`.
4. Run full test suite:
   ```bash
   pnpm verify
   ```
