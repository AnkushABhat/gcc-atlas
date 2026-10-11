# Handoff Report — Challenger 2 (UI, E2E & Browser Interaction)

## 1. Observation

### 1.1 Playwright E2E Test Suite (`pnpm test:e2e`)
Command executed: `pnpm test:e2e`
Result: Exit code 0. All 7 tests passed in 17.8s.
Output:
```text
Running 7 tests using 2 workers
  ✓ Setup Planner E2E Workflow › loads with default inputs and displays ranked candidate cities (4.7s)
  ✓ Setup Planner E2E Workflow › adjusting priority weights dynamically re-ranks candidate cities (5.5s)
  ✓ Setup Planner E2E Workflow › formats estimated monthly office cost ranges in INR (en-IN lakh/crore) (2.5s)
  ✓ Setup Planner E2E Workflow › opens sourced value popovers displaying HTTPS source URL and as-of date, closing on Escape (2.8s)
  ✓ Setup Planner E2E Workflow › displays candidate cities with missing metrics in the Not Ranked section per ADR 004 (2.6s)
  ✓ Home page smoke test › renders prototype disclaimer banner per ADR 006 (2.5s)
  ✓ Home page smoke test › renders home page title and link to planner (1.7s)
  7 passed (17.8s)
```

### 1.2 Adversarial UI & Interactive Behavior Harness
We executed an independent adversarial Playwright test suite (`scratch/adversarial_e2e.spec.ts`) evaluating 6 behavioral invariants:
1. **Dynamic re-ranking under extreme weight values (100% cost vs 100% talent vs 100% ecosystem)**:
   - When cost weight = 100 and talent = 0, Chennai (rent ₹62–₹88) and Hyderabad (rent ₹65–₹90) rank #1.
   - When talent weight = 100 and cost = 0, Bengaluru (talent 15–18 lakh) ranks #1.
   - When ecosystem weight = 100, Bengaluru and Hyderabad rank #1.
2. **Headcount & Space density changes**:
   - Adjusting headcount slider (10 to 1,000) and space-per-seat input (60 to 100 sq ft) recalculates estimated monthly office rent dynamically on all city cards.
3. **Data Provenance SourcedValue popover full lifecycle**:
   - Trigger button has `aria-haspopup="dialog"`, opens container with `role="dialog"`.
   - Contains verified HTTPS URL link with `target="_blank" rel="noopener noreferrer"`.
   - Contains exact as-of date (`YYYY-MM-DD`) and confidence badge (`reported`, `derived`, `estimate`).
   - Closes on `Escape` keypress as well as clicking outside the popover dialog.
4. **Currency & Unit formatting**:
   - All monthly office costs display formatted in INR (`en-IN` lakh/crore) with the `₹` symbol (e.g. `₹5.1 lakh / mo`, `₹1.2 crore / mo`).
   - Zero raw unformatted numbers appear in cost summaries.
5. **Non-imputation & "Not Ranked" section per ADR 004**:
   - Coimbatore (which has office rent verified but lacks tech talent count) is displayed under the dashed `Not Ranked` section.
   - Displays clear badge: `Missing: Tech Talent Count`.
   - Does NOT receive a rank badge (`#N`) or composite score.
   - Available verified metrics (office rent) and calculated office costs are shown honestly.
6. **Persistent ADR 006 disclaimer banner**:
   - Verified on both `/` and `/planner`.
   - Attributes: `role="status"`, `aria-live="polite"`.
   - Verbatim content: `GCC Atlas Prototype — nothing is sent to anyone` and `Demo Mode`.
Result: All 6 adversarial checks passed (22.3s).

### 1.3 Project Verification Toolchain (`pnpm verify`)
Command executed: `pnpm verify`
Result: Exit code 0.
- `pnpm typecheck` (`tsc --noEmit`): 0 errors.
- `pnpm lint` (`next lint`): 0 warnings or errors.
- `pnpm test` (`vitest run`): 13 tests passed across 2 test files.
- `pnpm data:validate` (`tsx scripts/validate-data.ts`): Seed data validated with 0 errors.
- `pnpm test:e2e` (`playwright test`): 7 passed.

### 1.4 Production Build (`pnpm build`)
Command executed: `pnpm build`
Result: **Exit code 1 (FAILED)**.
Verbatim error log:
```text
$ next build
   ▲ Next.js 15.5.27

   Creating an optimized production build ...
 ✓ Compiled successfully in 2.6s
   Linting and checking validity of types     ✓ Linting and checking validity of types 
   Collecting page data     ✓ Collecting page data 
 ⨯ useSearchParams() should be wrapped in a suspense boundary at page "/planner". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
    at g (/home/anusama/Projects/gcc-atlas/.next/server/chunks/418.js:32:23375)
    at m (/home/anusama/Projects/gcc-atlas/.next/server/chunks/418.js:16:74586)
    at D (/home/anusama/Projects/gcc-atlas/.next/server/app/planner/page.js:1:28807)
...
Error occurred prerendering page "/planner". Read more: https://nextjs.org/docs/messages/prerender-error
Export encountered an error on /planner/page: /planner, exiting the build.
 ⨯ Next.js build worker exited with code: 1 and signal: null
[ELIFECYCLE] Command failed with exit code 1.
```

Code location observed:
- File `src/app/planner/planner-client.tsx`, line 37:
  ```tsx
  export function PlannerClient({ initialCities }: PlannerClientProps) {
    const searchParams = useSearchParams();
  ```
- File `src/app/planner/page.tsx`, line 87:
  ```tsx
  export default async function PlannerPage() {
    ...
    return (
      <div className="space-y-8">
        ...
        <PlannerClient initialCities={plannerCities} />
      </div>
    );
  }
  ```
  `<PlannerClient>` is rendered directly without a `<Suspense>` wrapper.

---

## 2. Logic Chain

1. Per Requirement R1 and dispatch prompt step 3, both `pnpm build` and `pnpm verify` must succeed.
2. In Next.js App Router (Next.js 15), calling `useSearchParams()` in a client component triggers CSR bailout during static page generation. Next.js strictly requires that any component using `useSearchParams()` must be enclosed within a `<React.Suspense>` boundary when prerendering the page shell.
3. `src/app/planner/page.tsx` renders `<PlannerClient initialCities={plannerCities} />` directly without `<React.Suspense>`.
4. During `next dev` (which is used by `pnpm verify` via Playwright's webServer), Next.js dynamically renders without prerendering bailout failure.
5. However, during `pnpm build` (`next build`), Next.js prerenders all static routes. Prerendering fails at `/planner` with:
   `⨯ useSearchParams() should be wrapped in a suspense boundary at page "/planner"`.
6. Because `pnpm build` is a mandatory CI/production gate and is explicitly requested in dispatch step 3, this failure prevents production deployment and packaging.

---

## 3. Caveats

- We followed the strict rule: "Review-only — do NOT modify implementation code". Therefore, we did not patch `src/app/planner/page.tsx`.
- All interactive features, calculations, ADR 003/004/005/006 compliance, and Playwright E2E tests are functioning cleanly in the dev environment.

---

## 4. Conclusion

**VERDICT: REQUEST_CHANGES**

The UI, interactive behavior, provenance popovers, currency formatting, non-imputation logic, and E2E test suites pass with flying colors. However, **`pnpm build` fails with exit code 1** due to a missing `<Suspense>` boundary in `src/app/planner/page.tsx`.

### Actionable Fix Required:
In `src/app/planner/page.tsx`:
1. Import `Suspense` from `"react"`.
2. Wrap `<PlannerClient initialCities={plannerCities} />` in a `<Suspense>` boundary, e.g.:
```tsx
import React, { Suspense } from "react";
...
<Suspense fallback={<div className="p-8 text-center text-text-muted">Loading planner...</div>}>
  <PlannerClient initialCities={plannerCities} />
</Suspense>
```

---

## 5. Verification Method

To independently reproduce the failure:
```bash
pnpm build
```
Expected output before fix:
`⨯ useSearchParams() should be wrapped in a suspense boundary at page "/planner"` (exit code 1).

To verify the fix:
```bash
pnpm build && pnpm verify
```
Both commands must exit with code 0.
