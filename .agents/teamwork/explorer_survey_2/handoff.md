# Handoff Report — Explorer Survey 2: Routes, Pages, Interactive Components, and UX Explorer

**Author**: Explorer Survey 2  
**Date**: 2026-10-12  
**Target Recipient**: `orchestrator_1` (Conversation ID: `42b42f8f-bcfd-4e74-9a34-ad835aa577ed`)  
**Scope**: Full application routes, UI components, state architecture, interactive flows, layout shift risks, and visual upgrade roadmap for GCC Atlas.

---

## 1. Observation

Direct code inspections, line references, and architectural observations across the application:

### 1.1 Route & Component Architecture Matrix

| Route | Primary File | Mode | Key Components & Dependencies | Tested Selectors / Text Assertions |
|---|---|---|---|---|
| **Global Layout** | `src/app/layout.tsx` | Server + Client children | `DemoBanner` (`RoleSwitcher`), `VisualGuide`, `GuideTrigger`, Global `<header>`, `<main>`, `<footer>` | `role="status"` ("GCC Atlas Prototype — nothing is sent to anyone"), `role="dialog"` ("Quick Visual Guide"), `button` ("Open visual guide") |
| **Homepage** (`/`) | `src/app/page.tsx` | Server Component | Lucide icons, `ProviderLogo`, `Link` | `h1` ("Data-backed planning for GCC setup in India"), `link` ("Launch Setup Planner", href: `/planner`), `role="status"` banner |
| **Setup Planner** (`/planner`) | `src/app/planner/page.tsx`<br>`planner-client.tsx` | Server (Page) + Client (`PlannerClient`) | `PlannerClient`, `FactorBar`, `SourcedValue`, `Money`, Lucide icons | `h1` ("GCC Setup Planner"), `text` ("Prototype Simulation"), `h2` (/Ranked Candidate Cities/i), `section h3` (city name), `label` ("Target Headcount", "Space per Seat", "Talent Availability Weight", "Cost Efficiency Weight"), `span.font-mono` (/₹.*(lakh\|crore)/), `button[aria-haspopup='dialog']`, `dialog` ("Data provenance details"), `h2` (/Not Ranked/i), `text` ("Missing: Tech Talent Count") |
| **Providers Directory** (`/providers`) | `src/app/providers/page.tsx`<br>`filter-bar.tsx` | Server (Page) + Client (`ProvidersFilterBar`) | `ProvidersFilterBar`, `ProviderLogo`, Lucide icons | `h1` ("Service Providers"), `a[href^="/providers/"]`, `#category-filter`, `#city-filter`, `link` ("Clear filters"), empty state text |
| **Provider Profile** (`/providers/[slug]`) | `src/app/providers/[slug]/page.tsx`<br>`claim-button.tsx` | Server (Page) + Client (`ClaimButton`) | `ProviderLogo`, `ClaimButton`, Lucide icons | `h1` ({provider.name}), `data-testid="claimed-badge"`, `data-testid="owner-badge"`, button (/Claim profile/i). **Crucial assertion**: content must NOT contain "verified provider", "trusted provider", or "top provider". |
| **Request Intro** (`/request-intro`) | `src/app/request-intro/page.tsx`<br>`intro-form.tsx` | Server (Page) + Client (`IntroForm`) | `IntroForm`, Server Actions (`submitIntroRequestAction`) | `h1` ("Request an Introduction"), `role="note"` ("Prototype: nothing is sent to anyone."), inputs: `#buyerName`, `#buyerCompany`, `#buyerEmail`, `#citySlug`, `#headcount`, `#function`, `#category`, `#timeline`, `#chosenProviderSlug`, button ("Submit Intro Request"), `data-testid="lead-routed-confirmation"` |
| **Provider Inbox** (`/inbox`) | `src/app/inbox/page.tsx`<br>`inbox-client.tsx` | Server (Page) + Client (`inbox-client.tsx`) | `SwitchProviderHelper`, `DemoTopUpButton`, `OfferActionButtons`, `LedgerTable` (`DataTable`) | `h1` ("Provider Inbox"), `data-testid^="switch-provider-"`, `data-testid="credit-balance"`, button ("Demo: add 5 credits"), `data-testid^="offer-card-"`, `data-testid="status-accepted"`, `data-testid="buyer-contact-hidden"`, `data-testid="buyer-contact-revealed"`, buttons ("Accept (1 credit)", "Decline", "Flag as invalid (Refund 1 credit)"), `role="region"` ("Credit ledger transactions"), sort button ("Sort by Date") |

---

### 1.2 Homepage (`src/app/page.tsx`) Section Breakdown & Integration Points

`src/app/page.tsx` is an async Server Component that executes `Promise.all([listCities(), getAllLatestFacts(), countOperatingByCity(), listIncentives(), listProviders()])`.
Current sections and verbatim structure:
1. **Hero Section** (lines 35–67):
   - Provenance Pill: `<div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-accent-subtle text-accent border border-border text-xs font-medium">` with `ShieldCheck` icon. Text: `"Single source of truth for GCC leaders · Zero invented data"`.
   - Title: `<h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-text leading-tight">Data-backed planning for GCC setup in India</h1>`.
   - Description: `<p className="text-base text-text-muted leading-relaxed max-w-3xl">...Zero imputed estimates.</p>`.
   - CTAs: Primary `<Link href="/planner" className="... gradient-primary-btn ...">Launch Setup Planner</Link>` and Secondary `<Link href="/providers">Browse Vetted Providers ({totalProviders})</Link>`.
   - **Integration Point for Ambient Glow & Floating Metric Highlights**:
     - The hero currently lacks background depth. Ambient blurred radial mesh glows can be added via CSS radial background or decorative absolute layer (`pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-accent/15 via-teal-primary/10 to-transparent blur-3xl rounded-full`).
     - A two-column or asymmetric grid layout on desktop: Left column contains the badge, heading, copy, and interactive buttons with sliding arrow transitions; Right column contains floating elevated metric highlight cards (e.g. Card 1: `Top Match: Bengaluru` with score `84.5`, Card 2: `Grade-A Rent: ₹140–₹185 / sq ft`, Card 3: `100% Verified Citations & Zero Synthetic Imputation` with floating rotation and subtle shadow).
2. **Infinite Client / Benchmark Marquee Ticker**:
   - Currently, there is NO marquee ticker on the homepage; operating GCC benchmark brands (Goldman Sachs, Microsoft, SAP Labs, Novartis, Barclays, Mastercard, Wells Fargo from `data/seed/gccs.json`) are only shown as numeric counts.
   - **Integration Point**: Place immediately below the Hero section and above the KPI stats strip.
   - Build a continuous smooth CSS-animated marquee ticker with dual edge gradient fade masks (`mask-image` or absolute gradient overlays `w-20 from-background to-transparent`), displaying verified benchmark operating GCCs alongside vetted partner provider logos. Must pause on hover (`hover:[animation-play-state:paused]`).
3. **KPI Stats Strip** (lines 70–110):
   - Currently: `<section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-lg border border-border gradient-card shadow-xs">` displaying Hubs, Policies, GCCs, and 100% Sourced.
   - **Integration Point**: Upgrade each stat into an elevated card with `rounded-2xl`, glass/gradient depth, subtle border hover effect, and clean typography.
4. **Location Intelligence Matrix** (lines 113–203):
   - Table displaying city data with link "Model weights in Planner".
   - **Integration Point**: Wrap table in a sleek modern `rounded-2xl` card container with smooth table row hover transitions.
5. **Core Capability Pillars** (lines 206–280):
   - 3 cards: Multi-Factor Setup Planner, State Incentives Navigator, Vetted Provider Introductions.
   - **Integration Point**: Upgrade to Fortify/SyncMaster style feature pillars (`rounded-2xl`/`rounded-3xl`, icon container with gradient badge, subtle hover elevation, sliding arrow link CTA).
6. **Vetted Provider Ecosystem** (lines 282–324):
   - 8 provider cards in a 4-column grid.
   - **Integration Point**: Upgrade card hover micro-transitions (`scale-[1.02]`, border glow, smooth shadows).
7. **End-to-End Workflow Stepper** (lines 326–370):
   - 4 steps: Step 01 Model Requirements, Step 02 Inspect Evidence, Step 03 Match Subsidies, Step 04 Request Intros.
   - **Integration Point**: Visual stepper upgrade with connected progress line, numbered circular pill badges, and refined typography.

---

### 1.3 Setup Planner (`src/app/planner/...`) Parameter Control & Accordion Mechanics

`src/app/planner/page.tsx` renders `<PlannerClient initialCities={plannerCities} />` wrapped in `<Suspense>`.
`src/app/planner/planner-client.tsx` (635 lines) manages the complete interactive planner:

1. **State & URL Synchronization**:
   - Headcount state: `headcount` (range: 10–2000, step: 10, default: 100).
   - Space Density state: `sqftPerSeat` (number: 40–120, default: 60).
   - Functional Scope state: `selectedFunctions` (`engineering`, `product`, `data_analytics`, `operations`, `finance`).
   - Priority Weights: `weights: Record<Factor, number>` (`talent`, `cost`, `ecosystem`, `incentives`).
   - URL Sync: `useEffect` synchronizes state changes to URL search params using `window.history.replaceState` without triggering router navigation or layout flashes.
2. **Filtering & Ranking**:
   - `useMemo(filteredData)`: Filters `applicableIncentives` for each city by headcount thresholds (`minHeadcount <= headcount <= maxHeadcount`) and functional scope overlap.
   - `useMemo(rankingResult)`: Calls `rankCities(input, filteredData)` to generate `{ ranked, unranked }`.
3. **Ranked City Card Structure & E2E Selector Sensitivity**:
   - Container: `div` with `gradient-card border border-border rounded-md p-5 space-y-4 hover:border-border-strong hover:shadow-xs transition-all duration-150`.
   - **CRITICAL E2E SELECTOR**: `tests/e2e/planner.spec.ts` line 30:
     `const initialTopCard = page.locator("section h3").first();`
     `const newTopCity = page.locator("section h3").first();`
     The ranked city card's city name MUST remain in an `<h3>` and must be the FIRST `<h3>` element in `<section>`. Any additional `<h3>` placed above the city card in the section will break tests!
   - Top Match badge: currently lines 404–409:
     `<span className="px-2 py-0.5 rounded text-xs font-medium bg-accent-subtle text-accent border border-border inline-flex items-center gap-1"><Sparkles className="w-3 h-3 text-accent" /><span>Top Match</span></span>`
     Upgrade to an elevated, floating or angled badge token with `rounded-full` or `rounded-xl`.
   - Factor Contribution Bar: `<FactorBar factors={city.factors} score={city.score} />`.
     Segment widths animate via `style={{ width: `${f.contribution}%` }}` and `transition-all duration-150`.
   - Sourced Value Popover: `<SourcedValue fact={city.rentFact} label="Office Lease Rent" />`.
     Uses a button with `aria-haspopup="dialog"` opening a `<div role="dialog" aria-label="Data provenance details">` containing direct HTTPS source URL, in-document pinpoint clause, and as-of date. Escape key and outside click dismiss the popover.
   - Estimated Monthly Office Rent:
     `<Money min={city.officeCost.min} max={city.officeCost.max} perMonth />` displaying e.g. `₹14.0 lakh – ₹18.5 lakh / mo`.
4. **State Incentive Accordion Mechanics**:
   - Current implementation (lines 485–549):
     Button triggers `toggleIncentiveDetails(city.cityId)`, which toggles boolean `expandedIncentives[city.cityId]`.
     When true, renders an abrupt conditional `expandedIncentives[city.cityId] && (<div className="mt-2 space-y-2.5 ...">...)`.
   - **Upgrade Requirement R2**:
     Replace abrupt conditional rendering with a smooth CSS Grid animated accordion:
     ```tsx
     <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
       <div className="overflow-hidden">
         {/* Accordion body content */}
       </div>
     </div>
     ```
     This provides 60fps expansion/collapse without JavaScript layout calculations or height jumps.
5. **Unranked Cities Section (ADR 004 Non-Imputation)**:
   - Header with `h2` containing `/Not Ranked/i` and `AlertCircle` icon.
   - Badges with verbatim text `"Missing: Tech Talent Count"` and `"Missing: Office Rent"`. Must not alter these exact text labels because `planner.spec.ts` line 96 asserts `page.getByText("Missing: Tech Talent Count")`.

---

### 1.4 Providers Directory & Profiles (`src/app/providers/...`)

1. **Directory Page (`/providers`)**:
   - Ordered alphabetically (ADR 005, verified by `providers.spec.ts` lines 25–32).
   - `ProvidersFilterBar`:
     - Select elements: `#category-filter` and `#city-filter`.
     - Link: `"Clear filters"` (when active filters exist or in empty state).
     - Controlled via `useTransition` and `router.push`.
   - Provider Card:
     - Contains provider logo, category icon, claimed badge (if `claimedAt`), cities served pills, source citation, and link `<Link href={`/providers/${provider.slug}`}>View profile &rarr;</Link>`.
     - Hover transitions can be upgraded with elevated depth, `rounded-2xl`, and subtle teal accent glow.
2. **Provider Profile Page (`/providers/[slug]`)**:
   - Header with `ProviderLogo`, `h1` provider name, verified badge, and `ClaimButton`.
   - **CRITICAL E2E BANNED PHRASES**: `tests/e2e/providers.spec.ts` line 107–109 strictly tests:
     ```ts
     expect(content.toLowerCase()).not.toContain("verified provider");
     expect(content.toLowerCase()).not.toContain("trusted provider");
     expect(content.toLowerCase()).not.toContain("top provider");
     ```
     Therefore: The verified profile badge MUST say **"Verified Profile"** (current text) or **"Claimed"**, and MUST NEVER contain the words "verified provider", "trusted provider", or "top provider"!
   - `ClaimButton` (`src/app/providers/[slug]/claim-button.tsx`):
     - Unclaimed: button with text matching `/Claim profile/i`.
     - Claimed: renders `<span data-testid="claimed-badge">Claimed</span>`.
     - Owner: renders `<span data-testid="owner-badge">Owner</span>`.
     - Both `data-testid="claimed-badge"` and `data-testid="owner-badge"` are required for test pass.

---

### 1.5 Request Intro (`/request-intro`) & Inbox (`/inbox`)

1. **Request Intro (`/request-intro`)**:
   - Disclaimer notice per ADR 006: `<div role="note">Prototype: nothing is sent to anyone.</div>`.
   - Form inputs with IDs:
     - `#buyerName`, `#buyerCompany`, `#buyerEmail`, `#citySlug`, `#headcount`, `#function`, `#category`, `#timeline`, `#chosenProviderSlug`, textarea `#note`.
   - Submit button: `"Submit Intro Request"`.
   - On success: renders `<p data-testid="lead-routed-confirmation">Your intro request was created and routed to <strong>{offersCreated}</strong> matched service provider(s)...</p>`.
2. **Provider Inbox (`/inbox`)**:
   - Buyer view (unauthenticated / non-provider):
     - Renders `SwitchProviderHelper` with buttons having `data-testid={`switch-provider-${p.slug}`}`.
   - Provider view:
     - Header: `h1` "Provider Inbox", active provider link: "Managing leads for [Provider Name]".
     - Credit Wallet Widget:
       - Icon `Coins`.
       - Label: "Available credits".
       - Balance: `<div data-testid="credit-balance">{currentBalance} credits</div>`.
       - Demo top-up: `<button>Demo: add 5 credits</button>`.
       - Requirement R3: Modernize wallet widget with pulse indicator, elevated rounded-2xl container, and subtle gradient border.
     - Lead Offers List:
       - Each offer card has `data-testid={`offer-card-${offer.id}`}`.
       - Badges: `status === "offered"` ("Offered (Active)"), `status === "accepted"` (`data-testid="status-accepted"`), `status === "refunded"` ("Refunded (+1 credit)").
       - Contact Reveal:
         - Hidden state: `data-testid="buyer-contact-hidden"` with text "Contact hidden until accepted".
         - Revealed state: `data-testid="buyer-contact-revealed"` with buyer name and email.
       - Buttons in `OfferActionButtons`:
         - "Accept (1 credit)"
         - "Decline"
         - "Flag as invalid (Refund 1 credit)"
         - Error text: "Insufficient credits. Top up demo credits to accept leads."
     - Credit Ledger:
       - Section heading: `h2` "Credit ledger".
       - Rendered using `<DataTable>` with `role="region" aria-label="Credit ledger transactions"`.
       - Sortable column button `"Sort by Date"`.
       - Delta values: `+1`, `-1`.

---

## 2. Logic Chain

From the observations above, we establish the step-by-step logic for executing the visual and interactive upgrade without breaking functionality or tests:

1. **Constraint Alignment**:
   - Per `AGENTS.md` Rule 1 & ADR 003: Every number, incentive, provider, and GCC requires verified source URLs and as-of dates. No invented numbers.
   - Per `AGENTS.md` Rule 3 & ADR 005: Ranking is purely based on empirical facts. No pay-to-rank.
   - Per `AGENTS.md` Rule 5: Every visible control works or is not rendered. No dead buttons, lorem ipsum, or fake reviews.
   - Per `AGENTS.md` Rule 6: Zero new external runtime dependencies. Use native CSS, Tailwind 3.4 utilities, and Lucide icons already present in `package.json`.
2. **Selector Invariance & E2E Safety**:
   - The test suite has 21 Playwright E2E tests and 41 unit tests.
   - In `planner.spec.ts`: `page.locator("section h3").first()` targets the top ranked city name. Therefore, the main ranking section cannot introduce any `<h3>` element before or above the ranked city cards.
   - In `providers.spec.ts`: The page text on `/providers/[slug]` is checked via `expect(content.toLowerCase()).not.toContain("verified provider")` and `trusted provider` and `top provider`. Therefore, badge copy must strictly remain `"Verified Profile"` and never use those banned marketing phrases.
   - All `data-testid` attributes (`claimed-badge`, `owner-badge`, `lead-routed-confirmation`, `switch-provider-${slug}`, `credit-balance`, `offer-card-${id}`, `status-accepted`, `buyer-contact-hidden`, `buyer-contact-revealed`) must remain exactly on their respective elements.
   - All input IDs (`#buyerName`, `#buyerCompany`, `#buyerEmail`, `#citySlug`, `#headcount`, `#function`, `#category`, `#timeline`, `#chosenProviderSlug`, `#category-filter`, `#city-filter`, `#headcount-input`, `#sqft-input`) and ARIA labels must remain intact.
3. **Smooth 60fps Animation & Layout Shift (CLS) Prevention**:
   - **Marquee Ticker**: Use pure CSS transform with `@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`, `will-change: transform`, fixed height container, and dual gradient fade masks. Duplicating the item list ensures continuous, seamless infinite scrolling with zero layout recalculation.
   - **Accordions**: Implement fluid CSS Grid transitions using `grid-template-rows: 0fr` to `1fr`. This technique is pure CSS, runs on GPU, avoids JavaScript DOM measurements, and prevents layout shift.
   - **Button Micro-Interactions**: Implement sliding arrow transitions (`group-hover:translate-x-1 transition-transform duration-200`) without altering button padding or dimensions.
   - **Floating Cards & Glows**: Use CSS transforms (`translate-y`, `rotate-[-1deg]`, etc.) with `pointer-events-none` for ambient glows so interactive clicks are never obstructed.
   - **Prefers-Reduced-Motion**: Add `@media (prefers-reduced-motion: reduce)` globally in `globals.css` to disable marquee and floating animations for users requesting reduced motion.

---

## 3. Caveats

- **Sandbox File-System Permission**: During exploratory runs, `next lint` and `vitest run` encountered sandbox EROFS errors because they attempt to write cache/temp files into `.next/cache` and `node_modules/.vite-temp`. However, `pnpm typecheck` and `pnpm data:validate` ran synchronously and exited with code 0 (clean). When running full verification (`pnpm verify`), `BypassSandbox: true` is required so disk writes can succeed.
- **Provider Logos**: Authenticated logos already exist in `public/logos/providers/` for all 8 providers (`ansr-global.png`, `cbre-india.png`, `cyril-amarchand-mangaldas.png`, `deel-india.png`, `jll-india.png`, `remote-india.png`, `trilegal.png`, `zinnov-advisory.png`). For benchmark GCCs (Microsoft, Goldman Sachs, SAP, etc.), authentic SVG/clean monogram logo badges should be rendered using vetted data from `gccs.json` without inventing fictitious URLs.
- **Strict Layout Compliance**: The project strictly prohibits placing source code, tests, or data files inside `.agents/teamwork/`. Only metadata reports belong in `.agents/teamwork/`.

---

## 4. Conclusion & Route Upgrade Blueprint

The full application routes and components are mapped with complete clarity. Below is the actionable implementation plan for the upcoming implementation milestone:

### 4.1 Route Upgrade Blueprint

#### Route 1: Homepage (`/` -> `src/app/page.tsx`)
1. **Hero Ambient Glow & Layout**:
   - Wrap Hero in a container with ambient radial blurred gradients (`bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,95,96,0.12),transparent_70%)]`).
   - Create a desktop 2-column hero:
     - Left: Existing provenance pill, title, description, and dual CTA buttons with sliding arrow hover micro-interactions (`group-hover:translate-x-1`).
     - Right: Floating highlight cards with subtle rotation (`-rotate-1`), elevated shadows (`shadow-xl`), rounded-2xl borders, displaying live sourced figures (Top Match: Bengaluru, Prime Rent Range, 100% Sourced Citations).
2. **Infinite Continuous Marquee Ticker**:
   - Create reusable component `src/components/MarqueeTicker.tsx`.
   - Feed it operating benchmark GCCs from `gccs.json` (Goldman Sachs, SAP Labs, Microsoft, Novartis, Barclays, Mastercard, Wells Fargo) alongside vetted providers.
   - Gradient fade masks on left and right edges (`from-background to-transparent`).
   - Hover-to-pause micro-interaction.
3. **KPI Stats Strip**:
   - Modernize the 4 stat cards with `rounded-2xl`, subtle glass background (`bg-surface/80 backdrop-blur-xs`), elevated borders, and hover micro-elevation.
4. **Location Intelligence Matrix**:
   - Container updated to `rounded-2xl border border-border bg-surface shadow-xs`.
   - Subtle hover highlight on rows.
5. **Feature Capability Pillars**:
   - Update cards to `rounded-2xl` / `rounded-3xl` container cards with elevated icon rings, subtle depth, and sliding link arrow transitions.
6. **Workflow Stepper**:
   - Modern connected horizontal stepper with circular step badges, clean progress indicators, and elevated card surfaces.

#### Route 2: Setup Planner (`/planner` -> `src/app/planner/planner-client.tsx`)
1. **Parameters Sidebar**:
   - Update sidebar container with `rounded-2xl`, refined slider tracks, and modern toggle pill badges.
   - Keep all input IDs and accessible labels untouched.
2. **Ranked City Cards**:
   - Modernize card borders to `rounded-2xl`, with layered subtle drop shadow (`shadow-sm hover:shadow-md`).
   - Maintain the city name in `h3` as the very first `<h3>` in the section for test compatibility.
   - Elevate the "Top Match" badge into a floating pill badge with subtle sparkle icon.
3. **Factor Contribution Bar**:
   - Refine `FactorBar` with smooth rounded segments and clear tooltip / label indicators.
4. **Smooth Animated Incentive Accordions**:
   - Upgrade the collapsible incentive section from conditional rendering to CSS Grid `grid-rows-[0fr]` -> `grid-rows-[1fr]` with 300ms ease-out transition.
   - Keep exact text strings: `"Applicable State Incentives (${count})"` and `"0 state incentives qualify for current criteria"`.
5. **Unranked Cities Section**:
   - Style with clean dashed border and clear missing factor badges (`"Missing: Tech Talent Count"` and `"Missing: Office Rent"`).

#### Route 3: Service Providers (`/providers` & `/providers/[slug]`)
1. **Directory Page**:
   - Update filter bar and provider cards to `rounded-2xl` with elevated hover transitions.
   - Keep `#category-filter`, `#city-filter`, and "Clear filters" link untouched.
2. **Profile Page**:
   - Modernize profile card with `rounded-2xl` / `rounded-3xl`, verified badge, and claim button.
   - **Zero Marketing Jargon**: Ensure text strictly avoids "verified provider", "trusted provider", or "top provider". Keep `"Verified Profile"`.
   - Preserve `data-testid="claimed-badge"` and `data-testid="owner-badge"`.

#### Route 4: Request Intro & Inbox (`/request-intro` & `/inbox`)
1. **Request Intro Form**:
   - Refine form container to `rounded-2xl` with clean segmented input groups.
   - Preserve all input IDs (`#buyerName`, `#buyerCompany`, `#buyerEmail`, etc.) and `data-testid="lead-routed-confirmation"`.
2. **Provider Inbox**:
   - Modernize Credit Wallet Widget into an elevated card with pulsing indicator on available credits.
   - Maintain `data-testid="credit-balance"` matching `^\d+ credits`.
   - Refine lead offer cards with status pill badges and revealed contact box (`data-testid="buyer-contact-revealed"`).
   - Style the `LedgerTable` / `DataTable` with `rounded-2xl` and smooth sort hover states.

---

## 5. Verification Method

To independently verify the observations, component mappings, and guardrails:

1. **Verify TypeScript Strict Compilation**:
   ```bash
   pnpm typecheck
   ```
   *Expected output*: `tsc --noEmit` exits with 0 errors.

2. **Verify Seed Data Provenance**:
   ```bash
   pnpm data:validate
   ```
   *Expected output*: `Seed data validation passed with 0 errors.`

3. **Verify Full Test Suite (with sandbox bypass)**:
   ```bash
   pnpm verify
   ```
   *Expected output*:
   - Unit tests: 41 passing
   - Data validation: 0 errors
   - Playwright E2E tests: 21 passing across `smoke.spec.ts`, `planner.spec.ts`, `providers.spec.ts`, `leads.spec.ts`, `accessibility.spec.ts`, and `guide.spec.ts`.

4. **Verify Banned Term Guardrail on Provider Profile**:
   Run grep check to confirm forbidden marketing adjectives are absent from provider profile code:
   ```bash
   rg -i "(verified provider|trusted provider|top provider)" src/app/providers/
   ```
   *Expected output*: 0 matches.
