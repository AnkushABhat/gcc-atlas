# Project: GCC Atlas Visual Presentation & Interactive Upgrade

## Architecture
- **Framework & Styling**: Next.js 15 (App Router), React 19, Tailwind CSS 3.4, PostCSS, Lucide icons. Native CSS keyframes and utilities, zero external runtime dependencies.
- **Design Tokens & Animation System**: Extended Tailwind theme in `tailwind.config.ts` and ambient glow/accordion utilities in `src/app/globals.css`. 60fps GPU-accelerated keyframes (`fade-up`, `pop-in`, `float`, `marquee`, `pulse-glow`), multi-tier shadow tokens (`shadow-subtle`, `shadow-elevated`, `shadow-float`, `shadow-glow`), elevated container radii (`rounded-2xl`, `rounded-3xl`), and strict `prefers-reduced-motion` compliance.
- **Component Abstractions**: Shared presentation components in `src/components/`:
  - `MarqueeTicker.tsx`: Continuous horizontal marquee with dual gradient fade masks, pause on hover, rendering verified benchmark GCCs and partner provider logos.
  - `InteractiveButton.tsx`: Elevated CTA button/link with sliding arrow hover micro-interaction.
  - `SmoothAccordion.tsx`: Fluid CSS Grid (`grid-rows-[0fr]` to `grid-rows-[1fr]`) 60fps collapsible component.
  - `FloatingHighlightCard.tsx`: Elevated metrics card with subtle float and angled pill badges.
- **Routes & Pages**:
  - Homepage (`/` -> `src/app/page.tsx`): Hero ambient radial glows, floating highlight cards, marquee ticker, elevated KPI cards, location matrix, feature capability pillars, and workflow stepper.
  - Setup Planner (`/planner` -> `src/app/planner/planner-client.tsx`): Modernized parameter cards, ranked city cards with factor bars, floating "Top Match" badge, and smooth accordion incentive breakdowns.
  - Providers Directory & Profiles (`/providers`, `/providers/[slug]`): Sleek provider cards with hover elevation, filter pills, verified profile badges (preserving strict exclusion of banned phrases `"verified provider"`, `"trusted provider"`, `"top provider"`).
  - Request Intro & Inbox (`/request-intro`, `/inbox`): Form cards, pulsing credit wallet widget, offer cards, and polished transaction tables.
- **Data Provenance & Verification**: Strict adherence to `AGENTS.md` rules. Every figure has an authentic source URL, pinpoint citation, and as-of date. Verification contract: `pnpm verify` passes 100% cleanly (Typecheck, Lint, 41 Vitest unit tests, seed data validation, and 21 Playwright e2e tests).

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Native CSS Animation System | 60fps keyframes (`fade-up`, `pop-in`, `float`, `float-slow`, `marquee`, `pulse-glow`) in `tailwind.config.ts` | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Elevated Token System | Custom border-radius (`2xl`: 16px, `3xl`: 24px) and layered multi-tier shadows (`subtle`, `elevated`, `float`, `glow`) | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Ambient Radial Glows | Blurred mesh/radial gradient utilities (`ambient-glow-teal`, etc.) in `globals.css` | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Reduced Motion Handling | Automatic `@media (prefers-reduced-motion: reduce)` disabling continuous animations | M1 | ORIGINAL_REQUEST §R1 |
| 5 | Infinite Marquee Ticker | Continuous horizontal logo/brand ticker with left/right gradient fade masks and pause-on-hover | M1 | ORIGINAL_REQUEST §R2 |
| 6 | Button Micro-Interactions | Interactive buttons/links with smooth sliding arrow icon hover transition | M1 | ORIGINAL_REQUEST §R2 |
| 7 | Smooth Animated Accordion | Pure CSS Grid (`grid-rows-[0fr]` to `grid-rows-[1fr]`) 60fps collapsible transition | M1 | ORIGINAL_REQUEST §R2 |
| 8 | Floating Highlight Cards | Metric cards with subtle floating animation, drop shadows, and angled pill badges | M1 | ORIGINAL_REQUEST §R2 |
| 9 | Homepage Visual Upgrade | Hero with ambient glow and floating metrics, marquee integration, upgraded KPI strip, pillars, and stepper | M2 | ORIGINAL_REQUEST §R3 |
| 10 | Planner Visual Upgrade | Modern parameter card, ranked city cards, floating "Top Match" badge, and smooth incentive accordions | M2 | ORIGINAL_REQUEST §R3 |
| 11 | Providers Directory Upgrade | Sleek provider cards, filter pills, verified profile badges, preserving banned phrase rules | M3 | ORIGINAL_REQUEST §R3 |
| 12 | Request Intro & Inbox Upgrade | Modernized form card, credit wallet widget with pulse indicators, refined offer cards & ledger | M3 | ORIGINAL_REQUEST §R3 |
| 13 | Verification & Provenance Compliance | Complete pass of `pnpm verify` (typecheck, lint, 41 unit tests, validator, 21 e2e tests) & zero console errors | M4 | ORIGINAL_REQUEST §R4 |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Styling Foundation & Signature Components | `tailwind.config.ts`, `src/app/globals.css`, `src/components/MarqueeTicker.tsx`, `InteractiveButton.tsx`, `SmoothAccordion.tsx`, `FloatingHighlightCard.tsx` | None | DONE |
| M2 | Home & Planner Route Elevation | `src/app/page.tsx`, `src/app/planner/planner-client.tsx`, `src/app/planner/page.tsx` | M1 | DONE |
| M3 | Directory, Profile, Intro & Inbox Elevation | `src/app/providers/`, `src/app/request-intro/`, `src/app/inbox/` | M1, M2 | IN_PROGRESS |
| M4 | Final Integration, E2E Regression & Victory Audit | Full verification suite (`pnpm verify`), console error audit, manual browser checks | M1, M2, M3 | PLANNED |

---

## Interface Contracts

### M1 ↔ M2, M3
- **CSS Classes & Tokens**:
  - `animate-fade-up`, `animate-pop-in`, `animate-float`, `animate-float-slow`, `animate-marquee`, `animate-pulse-glow`.
  - `rounded-2xl` (16px), `rounded-3xl` (24px).
  - `shadow-subtle`, `shadow-elevated`, `shadow-float`, `shadow-glow`.
  - `accordion-grid`, `accordion-inner`, `ambient-glow-teal`.
- **Component Signatures**:
  - `MarqueeTicker`: `items: Array<{ id: string; name: string; category?: string; city?: string; logoSrc?: string; href?: string }>`, `label?: string`, `speedSeconds?: number`, `className?: string`.
  - `InteractiveButton`: `children: React.ReactNode`, `href?: string`, `onClick?: () => void`, `icon?: LucideIcon`, `variant?: 'primary' | 'secondary' | 'subtle'`, `size?: 'sm' | 'md' | 'lg'`, `className?: string`, `disabled?: boolean`, `type?: 'button' | 'submit'`.
  - `SmoothAccordion`: `title: React.ReactNode`, `children: React.ReactNode`, `icon?: React.ReactNode`, `badge?: React.ReactNode`, `defaultExpanded?: boolean`, `expanded?: boolean`, `onToggle?: (expanded: boolean) => void`, `className?: string`, `id?: string`.
  - `FloatingHighlightCard`: `title: string`, `value: React.ReactNode`, `subtitle?: string`, `badge?: string`, `icon?: React.ReactNode`, `className?: string`, `animate?: boolean`.

---

## Code Layout
- `tailwind.config.ts`: Tailwind configuration, animation keyframes, tokens. Exclusive owner: Worker M1.
- `src/app/globals.css`: Global styles, ambient glows, accordion grid classes, reduced motion overrides. Exclusive owner: Worker M1.
- `src/components/`: Reusable presentation components. Exclusive owner: Worker M1.
- `src/app/page.tsx`: Homepage route. Exclusive owner: Worker M2.
- `src/app/planner/`: Setup Planner route and client components. Exclusive owner: Worker M2.
- `src/app/providers/`: Directory and profile routes. Exclusive owner: Worker M3.
- `src/app/request-intro/`: Request intro route and form components. Exclusive owner: Worker M3.
- `src/app/inbox/`: Provider inbox route and client components. Exclusive owner: Worker M3.
