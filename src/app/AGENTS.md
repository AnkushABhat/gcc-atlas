# src/app/

Routes and UI. Calls modules through their `index.ts` only. No domain logic here.

## Routes
| Path | Purpose | Role |
|---|---|---|
| `/` | One-screen intro and a link to the Planner. No marketing filler. | any |
| `/planner` | Inputs + ranked results. State lives in the URL query so results are shareable. | any |
| `/cities/[slug]` | City detail: facts with sources, incentives, GCCs in our data. | any |
| `/providers`, `/providers/[slug]` | Directory and profile. | any |
| `/request-intro` | Intro form. `?provider=` preselects. | buyer |
| `/inbox` | Offers, accept/decline, credits, ledger. | provider |
| `/admin/data` | Facts by confidence, facts older than 24 months, `data/research/gaps.md` rendered. | admin |

## Rules
- Server components by default. Client components only for interactive controls (weight sliders, popovers, forms).
- Mutations are server actions: `requireRole` -> Zod parse -> module call -> revalidate. Return typed errors, not thrown strings.
- Every route has loading, empty and error states with specific copy. "No providers match these filters. Clear filters." not "Nothing here".
- Planner inputs update the URL (debounced for sliders). No client-side data fetching library.
- Lead screens show "Prototype: nothing is sent to anyone." at all times.
- No page may show a number that did not come from a module result carrying its source.
