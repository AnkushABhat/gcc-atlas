# Dispatch — Worker M3: Directory, Profiles, Intro & Inbox Route Elevation

## 2026-10-12T11:42:00Z

- **Role**: Directory, Profiles, Intro & Inbox Elevation Worker
- **Working Directory**: `/home/anusama/Projects/gcc-atlas/.agents/teamwork/worker_m3/`
- **Assigned Files**:
  - `src/app/providers/page.tsx`
  - `src/app/providers/filter-bar.tsx`
  - `src/app/providers/[slug]/page.tsx`
  - `src/app/request-intro/page.tsx`
  - `src/app/request-intro/intro-form.tsx`
  - `src/app/inbox/page.tsx`
  - `src/app/inbox/inbox-client.tsx`
- **Target Recipient**: orchestrator_1 (Conversation ID: 42b42f8f-bcfd-4e74-9a34-ad835aa577ed)
## 2026-10-12T11:42:32Z

You are Worker M3 (Directory, Profiles, Intro & Inbox Route Elevation Worker).
Your working directory: /home/anusama/Projects/gcc-atlas/.agents/teamwork/worker_m3/
The original user request is at: /home/anusama/Projects/gcc-atlas/.agents/teamwork/ORIGINAL_REQUEST.md
The project master plan is at: /home/anusama/Projects/gcc-atlas/PROJECT.md
The route survey handoff report is at: /home/anusama/Projects/gcc-atlas/.agents/teamwork/explorer_survey_2/handoff.md
The test constraint matrix is at: /home/anusama/Projects/gcc-atlas/.agents/teamwork/explorer_survey_3/handoff.md
The signature components from M1 are at:
- src/components/MarqueeTicker.tsx
- src/components/InteractiveButton.tsx
- src/components/SmoothAccordion.tsx
- src/components/FloatingHighlightCard.tsx

Read /home/anusama/Projects/gcc-atlas/.agents/teamwork/ORIGINAL_REQUEST.md and /home/anusama/Projects/gcc-atlas/AGENTS.md before starting.

YOUR EXCLUSIVE FILE OWNERSHIP:
- src/app/providers/page.tsx
- src/app/providers/filter-bar.tsx
- src/app/providers/[slug]/page.tsx
- src/app/request-intro/page.tsx
- src/app/request-intro/intro-form.tsx
- src/app/inbox/page.tsx
- src/app/inbox/inbox-client.tsx

DO NOT modify files outside your ownership.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL GUARDRAILS & SELECTOR CONSTRAINTS (DO NOT BREAK):
1. In `src/app/providers/` and `[slug]/page.tsx`:
   - BANNED MARKETING PHRASES: Do NOT use the phrases "verified provider", "trusted provider", or "top provider" anywhere in profile text, card copy, or badges. (Strictly asserted in tests/e2e/providers.spec.ts:107-109: expect(content).not.toMatch(/verified provider/i), expect(content).not.toMatch(/trusted provider/i), expect(content).not.toMatch(/top provider/i)). Use "Verified Profile" instead.
   - Retain `data-testid="claimed-badge"` and `data-testid="owner-badge"` when a profile is claimed.
   - Retain category and city filter parameter names (`?category=...`, `?city=...`) and empty state text with link "Clear filters".
   - Retain all authentic provider metadata: name, slug, category, cities, fee model, description, proven client types, partner count, founders, as-of dates, official source links.
2. In `src/app/request-intro/page.tsx` & `intro-form.tsx`:
   - Retain exact input IDs and names: `#buyerName`, `#buyerCompany`, `#buyerEmail`, `#citySlug`, `#headcount`, `#function`, `#category`, `#timeline`, `#chosenProviderSlug`.
   - Retain submit button text "Submit Intro Request".
   - Retain confirmation alert with `data-testid="lead-routed-confirmation"`.
   - Retain honest prototype disclaimer: "The prototype sends no real messages to anyone".
3. In `src/app/inbox/page.tsx` & `inbox-client.tsx`:
   - Retain credit balance indicator with `data-testid="credit-balance"`.
   - Retain demo role switcher buttons with `data-testid="switch-provider-*"`.
   - Retain offer cards with `data-testid="offer-card-${id}"`, `data-testid="buyer-contact-hidden"`, `data-testid="buyer-contact-revealed"`, and `data-testid="status-accepted"`.
   - Retain action buttons: "Accept (1 credit)" and "Decline".
   - Retain transaction credit ledger table.

YOUR OBJECTIVES:
1. Elevate Providers Directory & Profiles (`/providers`, `/providers/[slug]`):
   - Add `.ambient-glow-teal` subtle background texture.
   - Upgrade provider cards to modern `rounded-2xl border border-border bg-surface p-6 shadow-subtle hover:shadow-elevated transition-all`.
   - Upgrade category filter bar with modern rounded-full pill buttons, active state indicators, and smooth transitions.
   - Profile pages: Elevated hero with provider logo, verified profile pill badge ("Verified Profile"), structured metadata grid, fee model badge, proven clients list, and interactive intro request CTA button.
2. Elevate Request Intro Route (`/request-intro`):
   - Wrap intro form in modern `rounded-2xl bg-surface border border-border shadow-elevated p-8`.
   - Refined 2-column input layout with clear labels, modern inputs with focus rings, and clean select styling.
   - Upgrade submit button with `InteractiveButton` or polished button styling.
3. Elevate Provider Inbox Route (`/inbox`):
   - Credit Wallet Widget: Modern elevated card (`rounded-2xl bg-surface border border-border shadow-elevated p-6`) with live credit balance, pulse status indicator, and clear credit explanations.
   - Demo Role Switcher: Refined pill bar with subtle active highlight.
   - Lead Offer Cards: Modern `rounded-2xl` cards with buyer summary badges, timeline tags, and clear accept/decline action buttons.
   - Credit Ledger Table: Modern table with `rounded-2xl border border-border bg-surface shadow-subtle` styling, font-mono timestamps, colored delta badges (+1 / -1), and clean transaction history.
4. Verification:
   - Run `pnpm typecheck` and `pnpm lint`.
   - Run `pnpm test` and `pnpm data:validate`.
   - Re-seed db (`pnpm db:seed`) and run `NO_PROXY=localhost,127.0.0.1 pnpm test:e2e` (especially `tests/e2e/providers.spec.ts` and `tests/e2e/leads.spec.ts`).
   - Confirm zero console errors or warnings.
