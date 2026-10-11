# modules/planner

Scoring and cost estimation. Pure functions, no database, no framework. ADR 004.

## Interface (`index.ts`)
```ts
rankCities(input: PlannerInput, data: PlannerData): PlannerResult
estimateOfficeCost(headcount: number, sqftPerSeat: number, rent: Range): Range
```
- `PlannerInput`: `headcount`, `functions[]`, `sqftPerSeat` (default 60, labeled "assumption" in UI), `weights` (talent, cost, ecosystem, incentives), `selectedFactors`.
- `PlannerData`: cities with their facts, operating GCC counts, applicable incentives. The caller assembles it; the planner never fetches.
- `PlannerResult`: `ranked[]` and `unranked[]`.
  - ranked item: `cityId`, `score` (0-100), `factors[]` {factor, raw, normalized, weight, contribution, sourceFactIds}, `officeCost` (Range, INR per month), `incentives[]`.
  - unranked item: `cityId`, `missing[]` factors.

## Rules
- Factors: `talent` (higher better), `cost` (lower better, uses rent midpoint), `ecosystem` (higher better), `incentives` (count of applicable incentives, higher better).
- A city is ranked only if it has data for every selected factor. Otherwise it is unranked with the missing list. Never impute.
- Normalize min-max across ranked cities per factor. If all values are equal, normalized = 0.5 for that factor.
- Weights are normalized to sum to 1. All-zero weights is a validation error.
- Display cost as a range (rent min to rent max, times seats times sq ft). Scoring uses the midpoint. Never show the midpoint as "the cost".
- Deterministic. Ties break by city name ascending. No randomness, no clock, no I/O.
- Never read provider, credit or payment data.

## Tests that must exist (`*.test.ts`, inline fixtures only)
Ordering follows weights; changing weights can flip the order; missing data goes to unranked; cost factor inversion; equal values give 0.5; tie-break is stable; zero weights rejected; range math.
