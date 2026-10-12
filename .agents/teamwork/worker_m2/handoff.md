# Handoff Report — Worker M2: Homepage & Setup Planner Route Elevation

**Author**: Worker M2 (Homepage & Setup Planner Route Elevation Worker)  
**Date**: 2026-10-12  
**Target Recipient**: `orchestrator_1` (Conversation ID: `42b42f8f-bcfd-4e74-9a34-ad835aa577ed`)  
**Scope**: Full visual elevation, interactivity upgrade, and test compliance for Homepage (`/`) and Setup Planner (`/planner`).

---

## 1. Observation

Direct code observations, modifications, tool invocations, and test outputs:

### 1.1 Files Modified (Strict Exclusive Ownership)
Only three assigned files were modified. No files outside ownership were touched:
- `src/app/page.tsx` (Homepage)
- `src/app/planner/page.tsx` (Planner Page wrapper)
- `src/app/planner/planner-client.tsx` (Interactive Planner Client component)

### 1.2 Homepage (`src/app/page.tsx`) Elevation
1. **Hero Section**:
   - Integrated ambient teal radial mesh glow layers using `.ambient-glow-teal` positioned top-left (`-top-24 -left-20 w-[480px] h-[480px] opacity-70`) and right (`top-1/4 -right-24 w-[420px] h-[420px] opacity-60`).
   - Implemented responsive 2-column desktop grid (`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center`).
   - Left column retains exact semantic `h1`:
     ```tsx
     <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-text leading-[1.18]">
       Data-backed planning for GCC setup in India
     </h1>
     ```
   - Integrated dual `InteractiveButton`s:
     - Primary: `<InteractiveButton href="/planner" variant="primary" size="lg" showArrow={true}><Compass className="w-4 h-4 shrink-0" aria-hidden="true" /><span>Launch Setup Planner</span></InteractiveButton>`
       Retains exact accessible link name `"Launch Setup Planner"` with `href="/planner"`.
     - Secondary: `<InteractiveButton href="/providers" variant="secondary" size="lg" showArrow={false}><Building2 className="w-4 h-4 shrink-0" aria-hidden="true" /><span>Browse Vetted Providers ({totalProviders})</span></InteractiveButton>`
   - Right column showcases 3 elevated `FloatingHighlightCard`s (`animate={true}`, subtle rotations `-rotate-1` and `rotate-1`, drop shadows `shadow-elevated`) highlighting:
     - "Top Ranked Hub · Talent & Scale": Bengaluru with score `84.5` and live figures.
     - "Commercial Office Rent Range": `₹45 – ₹185` with `100% Sourced` badge.
     - "Verified Industrial Policies": `{totalIncentives} Policies` with `Zero Imputation` badge.
2. **Infinite Marquee Ticker**:
   - Integrated `MarqueeTicker` right below hero:
     ```tsx
     <MarqueeTicker
       label="Operating Benchmark GCCs & Ecosystem Partners"
       speedSeconds={35}
       className="rounded-2xl border border-border/80 bg-surface/60 backdrop-blur-xs p-4 shadow-subtle"
     />
     ```
     Features dual edge gradient fade masks (`from-background to-transparent`) and hover-to-pause micro-interaction.
3. **KPI Stats Strip**:
   - Upgraded all 4 stat cards into modern `rounded-2xl border border-border bg-surface p-5 space-y-1.5 shadow-subtle hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 group` containers with elevated monospace numbers and micro-animated icons.
4. **Location Intelligence Matrix**:
   - Wrapped table in modern `rounded-2xl border border-border bg-surface shadow-subtle overflow-hidden` container with smooth row hover transitions (`hover:bg-surface-raised/70 transition-colors duration-150`).
5. **Core Capability Pillars**:
   - Transformed 3 cards into modern feature pillars with `rounded-2xl border border-border bg-surface p-6 shadow-subtle hover:shadow-elevated hover:border-accent/40 transition-all duration-200 group`, elevated icon rings (`w-10 h-10 rounded-xl bg-accent-subtle text-accent border border-accent/20`), and sliding link arrow transitions (`group-hover:translate-x-0.5`).
6. **Provider Showcase & Workflow Stepper**:
   - Upgraded provider cards to `rounded-2xl shadow-subtle hover:shadow-elevated hover:-translate-y-0.5`.
   - Connected 4-step workflow stepper with circular numeric pill badges (`01`, `02`, `03`, `04`) and elevated `rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-subtle` card surface.

### 1.3 Setup Planner (`src/app/planner/...`) Elevation
1. **Planner Page Container (`src/app/planner/page.tsx`)**:
   - Added subtle `.ambient-glow-teal` background element.
   - Retained visible `h1` with exact text `"GCC Setup Planner"` and description.
2. **Parameters Sidebar (`src/app/planner/planner-client.tsx`)**:
   - Upgraded container to `rounded-2xl bg-surface border border-border p-6 space-y-6 shadow-elevated`.
   - Upgraded slider tracks with `h-2 bg-surface-raised rounded-lg accent-accent`.
   - Preserved exact accessible labels:
     - `aria-label="Target Headcount"`
     - `aria-label="Space per seat assumption"` (with label "Space per Seat")
     - `aria-label="Talent Availability Weight"`
     - `aria-label="Cost Efficiency Weight"`
     - `aria-label="Ecosystem Density Weight"`
     - `aria-label="State Policy Incentives Weight"`
   - Functional scope checkboxes retain exact names: `"Engineering & IT"`, `"Operations"`, `"Finance & Accounting"`, `"Product & R&D"`, `"Data & AI"`.
   - Retained disclaimer box with exact heading `"Prototype Simulation"`.
3. **Ranked City Cards**:
   - Retained city title in `<h3>` as the **FIRST `<h3>`** element inside `<section>`:
     ```tsx
     <h3 className="text-base sm:text-lg font-medium text-text">
       {city.cityName}
     </h3>
     ```
     No prior `<h3>` exists in the results section, preserving the Playwright `section h3` locator.
   - Elevate "Top Match" badge into floating pill badge with sparkle icon:
     ```tsx
     <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-subtle text-accent border border-accent/25 inline-flex items-center gap-1 shadow-xs transform -rotate-1 hover:rotate-0 transition-transform">
       <Sparkles className="w-3 h-3 text-accent" />
       <span>Top Match</span>
     </span>
     ```
   - Card container updated to `rounded-2xl border border-border bg-surface p-6 space-y-5 shadow-subtle hover:shadow-elevated hover:border-accent/40 transition-all duration-200 group`.
   - Preserved rent format with label `/Estimated Monthly Office Rent/i` and `<Money>` rendering `span.font-mono` matching `/₹.*(lakh|crore)/`.
   - Sourced popovers retain button with `aria-haspopup="dialog"`.
4. **Smooth CSS Grid Animated Accordions**:
   - Replaced abrupt conditional `{expandedIncentives[city.cityId] && (...) }` with fluid CSS Grid accordion:
     ```tsx
     <button
       type="button"
       onClick={() => toggleIncentiveDetails(city.cityId)}
       aria-expanded={Boolean(expandedIncentives[city.cityId])}
       className="w-full flex items-center justify-between text-xs text-text hover:text-accent font-medium py-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-lg transition-colors group/btn"
     >
       <span className="flex items-center gap-1.5">
         <FileText className="w-3.5 h-3.5 text-accent" />
         <span>Applicable State Incentives ({city.incentives.length})</span>
       </span>
       <ChevronDown
         className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
           expandedIncentives[city.cityId] ? "rotate-180 text-accent" : ""
         }`}
       />
     </button>

     <div
       className="accordion-grid"
       data-expanded={Boolean(expandedIncentives[city.cityId])}
     >
       <div className="accordion-inner">
         <div className="mt-2 space-y-2.5 pt-2 border-t border-border">
           ...
         </div>
       </div>
     </div>
     ```
   - Empty state text retained verbatim: `"0 state incentives qualify for current criteria"`.
5. **Unranked Cities Section**:
   - Heading retains `/Not Ranked/i`.
   - Cards styled with `rounded-2xl border border-dashed border-border-strong bg-surface/80 p-5 space-y-3.5 shadow-subtle`.
   - Missing factor badges retain exact text: `"Missing: Tech Talent Count"` and `"Missing: Office Rent"`.

---

## 2. Logic Chain

1. **Selector Contract Preservation**:
   - In `smoke.spec.ts`, Playwright asserts `page.getByRole("heading", { level: 1 })` has text `"Data-backed planning for GCC setup in India"` and `page.getByRole("link", { name: "Launch Setup Planner" })` has `href="/planner"`. Both requirements were verified passing.
   - In `planner.spec.ts`, the top ranked city is checked using `page.locator("section h3").first()`. Because the ranked city cards are the first cards rendered and city names are in `<h3>`, keeping them as the first `<h3>` in `<section>` guarantees this locator selects the top city without index drift.
   - In `planner.spec.ts`, dynamic weight adjustments (`Talent=0, Cost=100`) re-rank Chennai or Hyderabad to the top. By keeping the underlying state, scoring math, and `rankCities` call intact, domain calculations continue working identically.
   - In `planner.spec.ts:106,118`, tests assert `Applicable State Incentives (2)` and `0 state incentives qualify for current criteria`. By preserving these exact string formats in both the button and the empty state container, tests pass seamlessly while benefiting from the smooth CSS grid transition.
2. **Smooth Animation & Performance**:
   - The `.accordion-grid` rule in `globals.css` transitions `grid-template-rows: 0fr` to `1fr` in 250ms cubic-bezier. This executes purely in the compositor without triggering JavaScript layout recalculations or layout shifts.
   - The `MarqueeTicker` uses pure CSS `@keyframes marquee` with `will-change: transform`, pausing on hover and respecting `prefers-reduced-motion: reduce`.
   - Floating highlight cards use CSS transitions and GPU-accelerated keyframe transforms with `pointer-events-none` for ambient glows, preventing click blocking.
3. **Server vs. Client Boundary Safety**:
   - In `src/app/page.tsx` (a React Server Component), passing function references like `icon={Compass}` to `InteractiveButton` (a Client Component) caused Next.js serialization errors. Passing icon JSX elements directly within `children` (`<Compass className="..." aria-hidden="true" />`) solved this completely while preserving accessible link names.

---

## 3. Caveats

- **Proxy Environment in Sandbox**: When executing curl or web requests to `localhost:3000` on this development host, the environment variable `http_proxy` intercepts traffic unless `NO_PROXY=localhost,127.0.0.1` is set. The test execution commands (`pnpm test:e2e` and `pnpm verify`) succeed cleanly when run with `NO_PROXY=localhost,127.0.0.1`.
- **No other caveats**: All 21 Playwright E2E tests, 72 Vitest unit tests, seed validations, lint checks, and typechecks pass 100% cleanly.

---

## 4. Conclusion

Worker M2 has completed all assigned objectives with 100% fidelity:
1. Homepage (`src/app/page.tsx`) is elevated to a modern SaaS presentation matching Fortify, Glasto, and SyncMaster with ambient mesh glows, 2-column desktop hero, floating metric highlight cards, continuous benchmark marquee ticker, rounded-2xl KPI cards, modern location matrix, elevated capability pillars, and connected workflow stepper.
2. Setup Planner (`src/app/planner/page.tsx` & `src/app/planner/planner-client.tsx`) is elevated with a modern parameter sidebar card (`rounded-2xl shadow-elevated`), rounded-2xl ranked city cards with floating "Top Match" sparkle badge, smooth CSS Grid animated incentive accordions, and refined unranked city cards.
3. All critical selector guardrails and data provenance requirements are preserved.
4. `pnpm verify` passes with 0 errors across all 5 verification gates.

---

## 5. Verification Method

To independently verify the implementation:

1. **Run Unified Verification Suite**:
   ```bash
   NO_PROXY=localhost,127.0.0.1 pnpm verify
   ```
   *Expected Result*: Exits with code 0:
   - `tsc --noEmit`: 0 errors
   - `next lint`: 0 warnings or errors
   - `vitest run`: 72/72 tests passed
   - `tsx scripts/validate-data.ts`: 0 errors
   - `playwright test`: 21/21 passed

2. **Run Targeted Route Tests**:
   - Smoke tests (Homepage):
     ```bash
     NO_PROXY=localhost,127.0.0.1 pnpm test:e2e tests/e2e/smoke.spec.ts
     ```
   - Planner tests (Setup Planner):
     ```bash
     NO_PROXY=localhost,127.0.0.1 pnpm test:e2e tests/e2e/planner.spec.ts
     ```
   - Accessibility & Console Hygiene:
     ```bash
     NO_PROXY=localhost,127.0.0.1 pnpm test:e2e tests/e2e/accessibility.spec.ts
     ```

3. **Verify Git File Modifications**:
   ```bash
   git diff --name-only
   ```
   *Expected Result*:
   - `src/app/page.tsx`
   - `src/app/planner/page.tsx`
   - `src/app/planner/planner-client.tsx`
