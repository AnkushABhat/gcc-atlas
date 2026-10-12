## 2026-10-12T10:29:43Z

You are Worker M2 (Homepage & Setup Planner Route Elevation Worker).
Your working directory: /home/anusama/Projects/gcc-atlas/.agents/teamwork/worker_m2/
The original user request is at: /home/anusama/Projects/gcc-atlas/.agents/teamwork/ORIGINAL_REQUEST.md
The project master plan is at: /home/anusama/Projects/gcc-atlas/PROJECT.md
The route survey handoff report is at: /home/anusama/Projects/gcc-atlas/.agents/teamwork/explorer_survey_2/handoff.md
The test constraint matrix is at: /home/anusama/Projects/gcc-atlas/.agents/teamwork/explorer_survey_3/handoff.md
The signature components implemented in M1 are in: src/components/MarqueeTicker.tsx, src/components/InteractiveButton.tsx, src/components/SmoothAccordion.tsx, src/components/FloatingHighlightCard.tsx.

Read /home/anusama/Projects/gcc-atlas/.agents/teamwork/ORIGINAL_REQUEST.md, /home/anusama/Projects/gcc-atlas/AGENTS.md, and the reference documents before starting.

YOUR EXCLUSIVE FILE OWNERSHIP:
- src/app/page.tsx
- src/app/planner/page.tsx
- src/app/planner/planner-client.tsx

DO NOT modify files outside your ownership.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL E2E SELECTOR GUARDRAILS (DO NOT BREAK):
1. In `src/app/page.tsx`:
   - Must contain visible `h1` with exact text "Data-backed planning for GCC setup in India".
   - Must contain link with accessible name "Launch Setup Planner" and href="/planner".
2. In `src/app/planner/page.tsx` & `planner-client.tsx`:
   - In the results section, the ranked city name MUST remain in an `<h3>` and MUST be the FIRST `<h3>` element in `<section>` (`section h3`). NEVER add any `<h3>` element above or before the ranked city cards in that section.
   - Sliders must retain their exact accessible labels: "Target Headcount", "Space per Seat", "Talent Availability Weight", "Cost Efficiency Weight".
   - Rent formatting must remain in `span.font-mono` matching `/₹.*(lakh|crore)/` with text `/Estimated Monthly Office Rent/i`.
   - Sourced popover trigger button must retain `aria-haspopup="dialog"`.
   - Unranked section must keep heading matching `/Not Ranked/i` and exact badges `"Missing: Tech Talent Count"` and `"Missing: Office Rent"`.
   - Incentive button must keep exact text matching `"Applicable State Incentives (${count})"` and empty state text `"0 state incentives qualify for current criteria"`.
   - Checkbox names must remain "Engineering & IT", "Operations", "Finance & Accounting".

YOUR OBJECTIVES:
1. Elevate Homepage (`src/app/page.tsx`):
   - Hero Section: Add ambient teal radial mesh glow (`.ambient-glow-teal`), 2-column layout on desktop with floating highlight cards on the right (`FloatingHighlightCard` showcasing e.g. Top Match: Bengaluru with score, Office Rent Range, 100% Sourced Citations), and dual `InteractiveButton`s on the left ("Launch Setup Planner" with sliding arrow, and browse providers).
   - Infinite Marquee Ticker: Integrate `MarqueeTicker` right below hero displaying operating benchmark GCCs and partner logos with dual gradient masks and pause on hover.
   - KPI Stats Strip: Upgrade 4 stat cards with `rounded-2xl`, subtle glass/surface styling, elevated borders, and hover micro-elevation.
   - Location Intelligence Matrix: Wrap table in modern `rounded-2xl border border-border bg-surface` card with smooth row hover transitions.
   - Feature Capability Pillars: Upgrade cards to `rounded-2xl`/`rounded-3xl` with elevated icon rings, subtle depth, and sliding link arrow transitions.
   - Workflow Stepper: Connected horizontal stepper with circular step badges, clean progress indicators, and elevated card surfaces.
2. Elevate Setup Planner (`src/app/planner/planner-client.tsx` & `page.tsx`):
   - Parameter Control Card: Wrap in modern `rounded-2xl bg-surface border border-border shadow-elevated p-6`, modern slider tracks, toggle pills.
   - Ranked City Cards: Upgrade to `rounded-2xl border border-border shadow-subtle hover:shadow-elevated transition-all`, elevate "Top Match" badge into floating pill badge with sparkle icon, refine `FactorBar` display.
   - State Incentive Accordions: Replace conditional `{expandedIncentives[city.cityId] && (...)}` with smooth CSS Grid animated accordion (`.accordion-grid` with `data-expanded={isOpen}` or `SmoothAccordion`).
   - Unranked Cities Section: Style with clean dashed border and clear missing factor badges.
3. Verification:
   - Run `pnpm typecheck` and `pnpm lint`.
   - Run `pnpm test` and `pnpm data:validate`.
   - Run `pnpm test:e2e` (confirm all 21 Playwright tests pass, especially `smoke.spec.ts`, `planner.spec.ts`, and `accessibility.spec.ts`).
   - Ensure zero console warnings or errors.
