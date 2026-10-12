# E2E Test Infra: GCC Atlas

## Test Philosophy
- Opaque-box, requirement-driven. Derives from `ORIGINAL_REQUEST.md` and `AGENTS.md` verification contracts.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Interaction Testing + Real-World Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | 60fps Native Keyframe Animations & Tokens | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | Prefers-Reduced-Motion Media Query Compliance | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | Continuous Infinite Marquee Ticker & Fade Masks | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 4 | Button Micro-Interactions (Sliding Icon) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 5 | Smooth CSS Grid Accordions | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 6 | Floating Metric Highlight Cards & Badges | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 7 | Homepage Visual & Structural Upgrade | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 8 | Setup Planner Interactivity & Re-ranking | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 9 | Providers Directory & Negative Copy Assertions | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 10 | Request Intro Form & Routing Confirmation | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 11 | Provider Inbox, Credit Ledger & Contact Reveal | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 12 | Zero Console Errors & Full Accessibility | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |

## Test Architecture
- Test runner: Playwright (`playwright test`), Vitest (`vitest run`), `tsc --noEmit`, `next lint`, `scripts/validate-data.ts`.
- Command: `pnpm verify`.
- Invariant DOM Selectors:
  - Persistent disclaimer banner: `role="status"` with text `"GCC Atlas Prototype — nothing is sent to anyone"`.
  - Homepage heading: `h1` with `"Data-backed planning for GCC setup in India"`.
  - Launch button: `getByRole("link", { name: "Launch Setup Planner" })`.
  - Planner ranking section: `section h3` as the first city card title.
  - Sourced popover: `button[aria-haspopup='dialog']`.
  - Provider profile negative assertion: Forbidden strings `"verified provider"`, `"trusted provider"`, `"top provider"`.
  - Intro form inputs: `#buyerName`, `#buyerCompany`, `#buyerEmail`, `#citySlug`, `#headcount`, `#function`, `#category`, `#timeline`, `#chosenProviderSlug`.
  - Inbox: `data-testid="credit-balance"`, `data-testid="lead-routed-confirmation"`, `data-testid="status-accepted"`.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | GCC Leader Complete Setup Planning Journey | Home -> Launch Planner -> Adjust Sliders -> Inspect Rent Popover -> Expand Incentive Accordion -> Filter Functions | High |
| 2 | Intro Request Creation to Match Routing | Planner -> Request Intro -> Fill Valid Details -> Route to Matched Providers -> Verify Confirmation | High |
| 3 | Provider Inbox Lead Acceptance & Credit Debit | Role Switcher -> Select CBRE -> View Offered Lead -> Accept for 1 Credit -> Reveal Contact -> Check Ledger Debit | High |
| 4 | Lead Dispute & Credit Refund Workflow | Provider Inbox -> View Accepted Lead -> Flag as Invalid -> Check Status Refunded -> Verify +1 Credit Ledger | Medium |
| 5 | Directory Search, Filtering & Profile Verification | Browse Providers -> Filter Category / City -> Clear Filters -> Open Profile -> Verify Authentic Citations & No Banned Adjectives | Medium |
| 6 | Motion Accessibility Audit | Emulate reduced motion -> Verify Marquee static -> Accordions expand instantly -> Zero animation loop jank | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature
- Tier 2: ≥5 per feature (where boundaries exist)
- Tier 3: Pairwise coverage of major feature interactions
- Tier 4: ≥6 realistic application scenarios
