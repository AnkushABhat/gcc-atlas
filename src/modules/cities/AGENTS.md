# modules/cities

Owns cities, states, sourced facts, incentives. Source of every number the user sees about a place.

## Interface (`index.ts`)
`listCities()`, `getCity(slug)`, `getFacts(citySlug, metrics?)`, `listIncentives({stateSlug, headcount, functions, on})`.
Each fact returned includes its source fields. Callers never receive a bare number.

## Allowed metrics (closed set)
| Metric | Unit | Notes |
|---|---|---|
| `office_rent_inr_sqft_month` | INR per sq ft per month | Grade A / prime business districts. Say which in `note`. |
| `tech_talent_count` | people | Tech workforce in the city. Say how the source defines it in `note`. |

Operating GCC count is computed from `gccs`, not stored as a fact. Adding a metric: add it here, in the Zod enum, and in the planner.

## Constraints
- Incentive applicability: matches if headcount is within [min, max] when set, any requested function is in `functions` when set, and `on` is within [validFrom, validTo] when set. Unknown eligibility fields mean "applies", and the UI shows "Check eligibility with the state".
- Never merge facts from different `asOf` dates into one value. Show the most recent per metric; keep older rows.
- Expired incentives are hidden from results but kept in data.

## UI contract
Anything showing a fact renders `<SourcedValue>` (see `src/components/AGENTS.md`). No raw numbers.
