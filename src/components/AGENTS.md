# src/components/

Shared UI and design tokens. The product is judged on thinking and on how it looks. Both matter.

## Look
- Calm, dense, editorial. Think a good research terminal, not a SaaS landing page.
- Type: Geist Sans for text, Geist Mono for figures with `tabular-nums`. Two weights only (400, 500). Sentence case everywhere.
- Color: neutral warm grays plus one accent (deep teal). Semantic colors only for real states (error, warning). Light theme only.
- Define tokens once (CSS variables: surface, text, muted, border, accent, radius 6/10, space on a 4px grid). Components never hardcode hex.
- No gradients, no glows, no emoji, no stock illustrations. One subtle shadow allowed on popovers. Borders are 1px.
- Icons: `lucide-react`, 16px, only when they carry meaning.
- Motion: 150ms transitions on hover/focus only.

## Components that must exist
- `SourcedValue`: renders a number or range plus a confidence label ("Reported", "Derived", "Estimate"). Click or Enter opens a popover with source name, link, as-of date, note. Takes a fact row, never a raw number.
- `Money`: formats integer INR with `en-IN` (lakh/crore). One implementation, used everywhere.
- `DataTable`: sortable, sticky header, keyboard navigable, honest empty state.
- `FactorBar`: shows each factor's contribution to a city's score with the weight.
- `DemoBanner` and `RoleSwitcher`: header, always visible.

## Accessibility
Text contrast AA. Visible focus ring. Every control reachable by keyboard. Popovers close on Escape. Labels on all inputs. Lighthouse accessibility >= 95.
