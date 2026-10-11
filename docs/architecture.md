# Architecture

## Shape
Single Next.js app (App Router, TypeScript strict). One SQLite-compatible database (libSQL). No separate backend.

```
UI (src/app, src/components)
   | server actions / server components
Modules (src/modules/*)   pure domain logic + repo.ts per module
   |
DB (src/db)               Drizzle schema, migrations
   ^
Seeds (data/seed/*.json) -> scripts/seed.ts -> validated by scripts/validate-data.ts
```

## Modules
| Module | Owns | May call |
|---|---|---|
| `cities` | cities, states, facts (sourced metrics), incentives | none |
| `gccs` | GCC records (operating, announced) | `cities` |
| `planner` | scoring and cost estimation (pure functions) | `cities` |
| `providers` | provider records, claims, directory queries | `cities` |
| `leads` | leads, offers, routing, credit ledger | `providers`, `cities` |
| `auth` | demo roles, `requireRole()` | none |

## Cross-cutting rules
- A module exposes only what `index.ts` exports. Importing another module's internals is a bug.
- Every mutation is a server action that calls `requireRole()` then validates input with Zod, then calls a module function.
- Domain functions are pure where possible (inputs in, result out). Database access lives in `repo.ts`.
- All sourced numbers live in the `facts` table, never as columns on `cities`. ADR 003.
- Time comes from an injected clock in domain code so tests are deterministic.

## Data flow: intro request
buyer submits form -> action validates -> `leads.createLead` stores lead -> `leads.route` picks <=3 providers -> `lead_offers` rows (status `offered`) -> provider inbox lists offers -> accept: ledger -1 credit, offer `accepted`.
