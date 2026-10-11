## 2026-10-11T19:57:49Z
You are Worker 4 for Milestone M1-M3 Gate Remediation.
Your working directory is: /home/anusama/Projects/gcc-atlas/.agents/teamwork/worker_remediation_1
Workspace root: /home/anusama/Projects/gcc-atlas
Authoritative request: /home/anusama/Projects/gcc-atlas/.agents/teamwork/ORIGINAL_REQUEST.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Context:
Milestones M1, M2, and M3 have been built and reviewed. The gate review caught two specific items to fix:
1. Production build error in Next.js 15: `useSearchParams()` in `src/app/planner/planner-client.tsx` requires a Suspense boundary when prerendering `/planner`.
2. Functional Scope & Incentive Filtering: The functional scope checkboxes in `src/app/planner/planner-client.tsx` were not actively filtering incentives or affecting incentive factor scoring.

### Tasks to Implement:
1. **Fix `src/app/planner/page.tsx`**:
   - Import `Suspense` from `"react"`.
   - Wrap `<PlannerClient initialCities={plannerCities} />` in `<Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 text-center text-muted-foreground">Loading Setup Planner...</div>}>`.
   - Also ensure `plannerCities` maps `incentives` with `minHeadcount`, `maxHeadcount`, and parsed `functions` array so metadata is available client-side.

2. **Fix `src/modules/planner/types.ts`**:
   - In `IncentiveRef`, add:
     ```ts
     minHeadcount?: number | null;
     maxHeadcount?: number | null;
     functions?: string[] | null;
     ```

3. **Fix `src/app/planner/planner-client.tsx`**:
   - Implement genuine client-side filtering on incentives based on `headcount` and `selectedFunctions`:
     An incentive matches if:
     - `minHeadcount == null || headcount >= minHeadcount`
     - `maxHeadcount == null || headcount <= maxHeadcount`
     - If incentive has `functions` array: it matches if any function in incentive overlaps with `selectedFunctions` (or if `selectedFunctions.length === 0` or incentive functions is null/empty).
   - Recalculate each candidate city's `incentivesCount` as the number of matching incentives for that city, and pass that filtered incentive list to both display cards and `rankCities` data input (`incentives: Record<string, number>`).
   - This ensures that selecting/unselecting functional scope checkboxes and adjusting headcount immediately affects applicable incentives, incentive factor scores, and city rankings!

4. **Add `src/app/not-found.tsx`**:
   - Provide a clean Next.js 404 page so `pnpm build` prerenders completely without warnings.

5. **Verification**:
   - Run `pnpm build` -> must pass with exit code 0.
   - Run `pnpm data:validate` -> must pass with exit code 0.
   - Run `pnpm test` -> must pass all unit tests.
   - Run `pnpm verify` -> must pass all steps (typecheck, lint, vitest, data:validate, playwright e2e tests).

Document your changes and verification command outputs in your handoff report and send a message when complete.
