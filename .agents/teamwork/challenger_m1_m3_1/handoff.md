# Handoff Report — Challenger 1: Planner Domain Math & Ranking

## 1. Observation
1. **Codebase Under Review**:
   - `src/modules/planner/ranking.ts` (lines 43-181)
   - `src/modules/planner/cost.ts` (lines 7-18)
   - `src/modules/planner/types.ts`
   - `src/modules/planner/index.ts`
   - `src/modules/planner/planner.test.ts`
   - `docs/decisions/004-no-imputation.md`
   - `src/modules/planner/AGENTS.md`

2. **Test 1: ADR 004 Non-Imputation & Bounds Isolation**:
   - Tested candidate data containing:
     - City A: rent 100, talent 500k (ranked)
     - City B: rent 200, talent 1M (ranked)
     - City C: outlier rent 10, talent null (unranked due to missing talent)
     - City D: outlier talent 10M, rent null (unranked due to missing cost)
   - Executed via `npx tsx`:
     - Result unranked: `[{ id: 'city-c-outlier-missing-talent', missing: ['talent'] }, { id: 'city-d-outlier-missing-rent', missing: ['cost'] }]`
     - Ranked factor bounds in `ranking.ts:95-109`: evaluated strictly across `rankedCandidates`.
     - City A normalized cost score = 1.0 (50.0 contribution at weight 0.5); City B normalized cost score = 0.0 (0.0 contribution).
     - City A normalized talent score = 0.0; City B normalized talent score = 1.0.
     - Confirmed: Outlier values (rent 10 and talent 10,000,000) from unranked cities did NOT contaminate min/max bounds of ranked candidates.

3. **Test 2: Factor Normalization**:
   - Inverted cost:
     - 3 cities with rents 50, 100, 150:
     - City Low (rent 50) normalized cost score = `1.0`
     - City Mid (rent 100) normalized cost score = `0.5`
     - City High (rent 150) normalized cost score = `0.0`
     - Matches formula `(bounds.max - raw) / (bounds.max - bounds.min)` at `ranking.ts:123`.
   - Equal factor values across all cities:
     - Evaluated cities where rent, talent, operating GCCs, and incentives counts were identical.
     - Normalized score for every factor was exactly `0.5`. Composite score was `50.0`. Matches fallback at `ranking.ts:130`.

4. **Test 3: Weight Dynamics & Dynamic Re-ordering**:
   - Evaluated City Talent-Heavy (talent 2M, rent 190, GCCs 100, inc 0) vs City Cost-Heavy (talent 100k, rent 50, GCCs 5, inc 3):
     - At weight `{ talent: 100, cost: 0, ecosystem: 0, incentives: 0 }`: City Talent-Heavy ranked #1 (score 100.0), City Cost-Heavy #2 (score 0.0).
     - At weight `{ talent: 0, cost: 100, ecosystem: 0, incentives: 0 }`: City Cost-Heavy ranked #1 (score 100.0), City Talent-Heavy #2 (score 0.0) — cleanly flipped.
     - At weight `{ talent: 0, cost: 0, ecosystem: 100, incentives: 0 }`: City Talent-Heavy ranked #1 (score 100.0).
     - At weight `{ talent: 0, cost: 0, ecosystem: 0, incentives: 100 }`: City Cost-Heavy ranked #1 (score 100.0).

5. **Test 4: Edge Cases**:
   - All-zero weights `{ talent: 0, cost: 0, ecosystem: 0, incentives: 0 }`: Threw `Error: "Total weight of active factors must be greater than zero"` at `ranking.ts:52`.
   - Negative total weight: Threw `Error: "Total weight of active factors must be greater than zero"`.
   - Score tie-breaking: 4 cities ("Zulu City", "Alpha City", "Mike City", "Bravo City") with identical composite scores (50.0) were deterministically sorted to: `["Alpha City", "Bravo City", "Mike City", "Zulu City"]` via `localeCompare` ascending at `ranking.ts:174`.
   - Selected factors subset: With `selectedFactors: ["talent", "ecosystem"]`, a city with null `rentFact` was successfully retained in `ranked` with accurate scores, as cost was not among active factors.
   - Single-city input: Ranked cleanly with normalized factors 0.5 and composite score 50.0.
   - Zero-cities input: Returned empty `ranked: []` and `unranked: []` without throwing.
   - `estimateOfficeCost`: Standard headcount (100 seats, 60 sqft, rent 80-120) gave `{ min: 480000, max: 720000 }`; headcount 0 and -5 yielded `{ min: 0, max: 0 }`.

6. **Test 5: Full Project Verification**:
   - `pnpm test` (vitest): 13/13 tests passed (9 planner unit tests + 4 smoke tests).
   - `pnpm verify`:
     - `tsc --noEmit`: Clean, 0 errors.
     - `next lint`: Clean, 0 errors.
     - `vitest run`: 13/13 passed.
     - `tsx scripts/validate-data.ts`: Passed with 0 errors.
     - `playwright test`: 7/7 e2e tests passed (`7 passed (13.0s)`).

## 2. Logic Chain
1. Per ADR 004, cities with missing factual data for user-selected factors must be placed into `unranked` and excluded from scoring. Lines 58-93 of `ranking.ts` iterate through cities, push those with missing factors to `unranked`, and only place complete candidates into `rankedCandidates`.
2. Per ADR 004 bounds isolation, lines 96-109 iterate strictly over `rankedCandidates` to determine min and max boundaries. Observation 2 verified that extreme outlier values in unranked cities do not distort min/max boundaries of ranked cities.
3. Factor inversion requires lower rent to yield higher normalized values. Lines 121-124 compute `(bounds.max - raw) / (bounds.max - bounds.min)` for cost, which Observation 3 verified maps lowest rent to 1.0 and highest to 0.0.
4. Equal factor values must yield 0.5. Line 130 sets `normalized = 0.5` when `bounds.max <= bounds.min`, which Observation 3 verified yields 0.5 across all equal-factor cities and single-city cases.
5. Tie-breaking requires deterministic alphabetical order. Lines 170-175 sort by composite score descending, breaking ties with `a.cityName.localeCompare(b.cityName)`, which Observation 5 verified properly ordered Alpha, Bravo, Mike, Zulu.
6. Edge cases (all-zero weights, unselected factors, zero/negative headcounts) were tested and verified to behave safely per contract.
7. Both `pnpm test` and `pnpm verify` run and pass cleanly with zero errors.

## 3. Caveats
- `src/app/planner/page.tsx` renders `<PlannerClient>` which calls `useSearchParams()`. While `pnpm verify` passes cleanly with Playwright in dev mode, Next.js 15 static prerendering (`next build`) advises wrapping search params consumers in `<React.Suspense>`. This is a minor non-blocking recommendation for production build optimization, outside the pure domain engine.
- No other caveats.

## 4. Conclusion
**VERDICT: APPROVE**

The Setup Planner domain engine (`src/modules/planner/`) conforms strictly to ADR 004, `AGENTS.md`, and the architectural contract. All 5 adversarial challenge dimensions (ADR 004 Non-Imputation & bounds isolation, factor normalization & cost inversion, dynamic weight flipping, deterministic tie-breaking & edge cases, and CI test/verify suites) passed empirical verification.

## 5. Verification Method
To independently reproduce and verify this assessment:
```bash
# 1. Run unit tests
pnpm test

# 2. Run full verification suite (typecheck, lint, unit tests, data validator, e2e)
pnpm verify

# 3. Run empirical adversarial stress harness
npx tsx -e '
import { rankCities, estimateOfficeCost } from "./src/modules/planner/index";
// See detailed script in Observation sections 2-5
'
```
