# Verification Suite, Tests, and Data Provenance Report

**Explorer**: Survey 3 (Verification Suite, Tests, and Data Provenance Explorer)  
**Date**: 2026-10-12  
**Working Directory**: `/home/anusama/Projects/gcc-atlas/.agents/teamwork/explorer_survey_3/`  
**Reference Target**: Complete compliance with `pnpm verify` during visual aesthetic redesign.

---

## 1. Observation

Direct examination of the GCC Atlas repository yielded the following facts, toolchain configurations, test suites, and data provenance requirements:

### 1.1 Toolchain & Package Scripts (`package.json:18`)
In `package.json`:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "tsx scripts/migrate.ts",
  "db:seed": "tsx scripts/seed.ts",
  "data:validate": "tsx scripts/validate-data.ts",
  "verify": "pnpm typecheck && pnpm lint && pnpm test && pnpm data:validate && pnpm test:e2e"
}
```
Executing `pnpm verify` executes 5 serial gates:
1. `tsc --noEmit`: Strict TypeScript checking (no `any`, no unresolved imports, strict null checks).
2. `next lint`: ESLint with Next.js rules (`eslint-config-next: ^15.1.0`).
3. `vitest run`: 5 test files, 41 unit tests executed across `src/modules` and `tests/unit`.
4. `tsx scripts/validate-data.ts`: Validates 6 seed files in `data/seed/` with Zod schemas.
5. `playwright test`: 6 spec files, 21 e2e tests executed in Chromium with 1 worker.

Execution results verified directly:
- `pnpm typecheck && pnpm lint && pnpm test && pnpm data:validate`: **Passed (41 tests, 0 errors)**
- `pnpm test:e2e`: **Passed (21 tests, 57.2s, 0 errors)**

### 1.2 Playwright E2E Test Suite Inventory (`tests/e2e/`)

Every locator, selector, role, attribute, and text assertion was cataloged from `tests/e2e/`:

#### A. `tests/e2e/smoke.spec.ts` (2 tests)
- **Line 6–8**: `page.getByRole("status")` must be visible and contain text `"GCC Atlas Prototype — nothing is sent to anyone"`.
- **Line 13**: `page.toHaveTitle(/GCC Atlas/)`.
- **Line 14–16**: `page.getByRole("heading", { level: 1 })` must be visible and contain `"Data-backed planning for GCC setup in India"`.
- **Line 18–20**: `page.getByRole("link", { name: "Launch Setup Planner" })` must have attribute `href="/planner"`.

#### B. `tests/e2e/guide.spec.ts` (1 test)
- **Line 10**: Header guide trigger button: `page.getByRole("button", { name: "Open visual guide" })`.
- **Line 16**: Dialog role: `page.getByRole("dialog", { name: "Quick Visual Guide" })`.
- **Line 20–21**: Dialog text: `"Step 1 of 4"` and `"Model Location Priorities & Costs"`.
- **Line 24**: Next button: `dialog.getByRole("button", { name: "Next step" })`.
- **Line 26–27**: Step 2 text: `"Step 2 of 4"` and `"Explore Vetted Service Providers"`.
- **Line 30**: Back button: `dialog.getByRole("button", { name: "Back" })`.
- **Line 38**: Skip button: `dialog.getByRole("button", { name: "Skip guide" })`.
- **Line 47–49**: LocalStorage key: `localStorage.getItem("gcc_atlas_guide_dismissed") === "true"`.
- **Line 56**: Dismisses on `Escape` key (`page.keyboard.press("Escape")`).

#### C. `tests/e2e/planner.spec.ts` (6 tests)
- **Line 8**: `page.getByRole("heading", { name: "GCC Setup Planner" })`.
- **Line 12**: `page.getByText("Prototype Simulation")`.
- **Line 16**: `page.getByRole("heading", { name: /Ranked Candidate Cities/i })`.
- **Line 20–23**: City headings in ranked list: `page.getByRole("heading", { name: "Bengaluru" })`, `"Hyderabad"`, `"Pune"`, `"Mumbai"`.
- **Line 30 & 43**: Top ranked card DOM hierarchy: `page.locator("section h3").first()`. The city name in ranked cards MUST be an `h3` directly under the results `section`!
- **Line 34–35**: Sliders with exact accessible labels:
  - `page.getByLabel("Talent Availability Weight")`
  - `page.getByLabel("Cost Efficiency Weight")`
- **Line 45–46**: Dynamic re-ranking logic: When Cost=100 and Talent=0, `newCityName` must be in `["Chennai", "Hyderabad"]`.
- **Line 53**: Text label: `page.getByText(/Estimated Monthly Office Rent/i)`.
- **Line 57**: Cost formatting class & regex: `page.locator("span.font-mono").filter({ hasText: /₹.*(lakh|crore)/ })`. The formatted cost string MUST be rendered in an element with class `.font-mono` containing `₹` and `lakh` or `crore`.
- **Line 65**: Sourced value trigger: `page.locator("button[aria-haspopup='dialog']").first()`.
- **Line 70–77**: Provenance popover dialog:
  - `page.getByRole("dialog", { name: "Data provenance details" })`
  - `popover.getByText("Source Attribution")`
  - `popover.locator("a[href^='https://']")` (must have direct https link)
  - `popover.getByText(/As-of Date:/i)`
  - Closes on `Escape` key.
- **Line 88–97**: Unranked section per ADR 004:
  - Heading: `page.getByRole("heading", { name: /Not Ranked/i })`
  - Heading: `page.getByRole("heading", { name: "Coimbatore" })`
  - Missing metric pill: `page.getByText("Missing: Tech Talent Count")`
- **Line 106–126**: State incentives breakdown:
  - Text: `page.getByText(/Applicable State Incentives \(2\)/).first()`
  - Checkboxes: `page.getByRole("checkbox", { name: "Engineering & IT" })`, `"Operations"`, `"Finance & Accounting"`.
  - Empty incentive match text: `page.getByText("0 state incentives qualify for current criteria").first()`.
  - Query parameter support: `page.goto("/planner?headcount=10")`.

#### D. `tests/e2e/providers.spec.ts` (6 tests)
- **Line 21**: `page.getByRole("heading", { name: "Service Providers", exact: true })`.
- **Line 25**: `page.locator('a[href^="/providers/"]')` (directory lists provider cards in alphabetical order).
- **Line 37**: Select element: `page.locator("#category-filter")` (must retain exact HTML ID `#category-filter`).
- **Line 44–46**: Filter links: `page.getByRole("link", { name: "Cyril Amarchand Mangaldas" })`, `page.getByRole("link", { name: "Trilegal" })`, `page.getByRole("link", { name: "ANSR", exact: true })`.
- **Line 58**: Select element: `page.locator("#city-filter")` (must retain exact HTML ID `#city-filter`).
- **Line 81–85**: Honest empty state: `page.getByText("No providers match these filters. Clear filters.")` and `page.getByRole("link", { name: "Clear filters" })`.
- **Line 98–103**: Provider profile `/providers/ansr-global`:
  - `page.getByRole("heading", { name: "ANSR", exact: true })`
  - `page.getByText("Setup Advisor")`
  - `page.getByText("https://ansr.com")`
  - `page.getByText("ANSR Corporate Overview")`
- **Line 106–109 — CRITICAL BANNED ADJECTIVE CHECK**:
  ```ts
  const content = await page.content();
  expect(content.toLowerCase()).not.toContain("verified provider");
  expect(content.toLowerCase()).not.toContain("trusted provider");
  expect(content.toLowerCase()).not.toContain("top provider");
  ```
  *Crucial Alert for R3*: Even though user prompt R3 mentions "verified profile badges", the code strictly checks that the strings `"verified provider"`, `"trusted provider"`, and `"top provider"` do NOT appear anywhere in the provider profile HTML! (The existing badge is `"Verified Profile"`, not `"verified provider"`).
- **Line 122–132**: Claim flow on `/providers/remote-india`:
  - Button: `page.getByRole("button", { name: /Claim profile/i })`
  - Badges: `page.getByTestId("claimed-badge")` with text `"Claimed"`, `page.getByTestId("owner-badge")` with text `"Owner"`.

#### E. `tests/e2e/leads.spec.ts` (3 tests)
- **Line 14**: `page.getByRole("heading", { name: "Request an Introduction" })`.
- **Line 19**: Disclaimer: `page.getByText("Prototype: nothing is sent to anyone.")`.
- **Line 24–34**: Specific input IDs:
  - `#buyerName` (input)
  - `#buyerCompany` (input)
  - `#buyerEmail` (input)
  - `#citySlug` (select)
  - `#headcount` (input)
  - `#function` (select)
  - `#category` (select)
  - `#timeline` (select)
  - `#chosenProviderSlug` (select)
- **Line 35**: Button: `page.getByRole("button", { name: "Submit Intro Request" })`.
- **Line 38 & 135–142**: Confirmation locator: `page.getByTestId("lead-routed-confirmation")` containing text matching `/routed to (\d+)/`.
- **Line 43 & 181**: Demo provider switch buttons:
  - `page.getByTestId("switch-provider-cbre-india")`
  - `page.getByTestId("switch-provider-trilegal")`
- **Line 49–51**: Inbox header: `page.getByRole("heading", { name: "Provider Inbox" })`, `page.getByText("Managing leads for CBRE India")`.
- **Line 54**: Credit balance: `page.getByTestId("credit-balance")`.
- **Line 60**: Offer card locator: `page.locator("div[data-testid^='offer-card-']").first()`.
- **Line 64–66**: Hidden contact state:
  - `offerCard.getByTestId("buyer-contact-hidden")`
  - `offerCard.getByText("Contact hidden until accepted")`
- **Line 70**: Accept button: `offerCard.getByRole("button", { name: "Accept (1 credit)" })`.
- **Line 76**: Accepted badge: `offerCard.getByTestId("status-accepted")`.
- **Line 79–81**: Revealed contact:
  - `offerCard.getByTestId("buyer-contact-revealed")`
  - `offerCard.getByText("Vikram Malhotra")`
  - `offerCard.getByText(uniqueEmail)`
- **Line 90–93**: Ledger entries:
  - `page.getByRole("cell", { name: "Lead Introduction Accepted" }).first()`
  - `page.getByRole("cell", { name: "-1" }).first()`
- **Line 95**: Refund button: `offerCard.getByRole("button", { name: "Flag as invalid (Refund 1 credit)" })`.
- **Line 102**: Refunded status: `offerCard.getByText("Refunded (+1 credit)")`.
- **Line 112–115**: Ledger refund entries:
  - `page.getByRole("cell", { name: "Invalid Lead Refund" }).first()`
  - `page.getByRole("cell", { name: "+1" }).first()`
- **Line 195**: Zero credit error text: `page.getByText("Insufficient credits. Top up demo credits to accept leads.")`.
- **Line 199**: Active offer text: `offerCard.getByText("Offered (Active)")`.
- **Line 202**: Demo top up button: `page.getByRole("button", { name: "Demo: add 5 credits" })`.

#### F. `tests/e2e/accessibility.spec.ts` (3 tests)
- **Line 8–17**: Zero console error check on `/planner`:
  ```ts
  const consoleErrors: string[] = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  expect(consoleErrors).toEqual([]);
  ```
  Any runtime uncaught error, hydration mismatch, invalid DOM prop (e.g. invalid SVG attribute, unescaped character, undefined key) fails this test!
- **Line 20–27**: Accessible labels on `/planner`:
  - `page.getByLabel("Target Headcount")`
  - `page.getByLabel(/Space per Seat/i)`
  - `page.getByLabel("Talent Availability Weight")`
- **Line 30–32**: Slider keyboard arrows: focus slider, press `ArrowRight` twice.
- **Line 35–46**: Sourced popover keyboard navigation: focus `button[aria-haspopup='dialog']`, press `Enter`, dialog opens, press `Escape`, dialog closes.
- **Line 52–71**: Zero console error check on `/inbox`.
- **Line 74–93**: DataTable keyboard sorting:
  - Container region: `page.getByRole("region", { name: "Credit ledger transactions" })`.
  - Header button: `ledgerTable.getByRole("button", { name: "Sort by Date" })`.
  - Column sort state: `th[aria-sort]` toggles between `"descending"` and `"ascending"` upon keyboard `Enter`.
- **Line 98–110**: Semantic HTML and persistent disclaimer on all routes `["/", "/planner", "/providers", "/request-intro", "/inbox"]`:
  - Every route MUST render at least one visible `h1` element (`page.locator("h1").first().toBeVisible()`).
  - Every route MUST render the persistent disclaimer banner with `role="status"` (`page.getByRole("status").toBeVisible()`).

### 1.3 Unit Tests & Data Integrity (`src/modules/**/*.test.ts`, `tests/unit/*.test.ts`)
- **41 Vitest Tests**:
  - `tests/unit/smoke.test.ts`: Validates ADR 003 schema rules. Strictly tests that `schema.cities` has NO numeric columns (all numbers reside in `schema.facts`), and `schema.facts` has NOT NULL on `source_name`, `source_url`, `as_of`, `confidence`.
  - `src/modules/planner/planner.test.ts`: Tests `estimateOfficeCost` calculation and `rankCities` normalization. Verifies tie-breaking deterministically orders by city name ascending, and missing metric cities are placed in `unranked` (ADR 004 non-imputation).
  - `src/modules/leads/leads.test.ts`: Verifies fair rotation algorithm, cap of 3 providers, contact email hiding, 72h expiration, credit debit/refund, and ledger sum consistency.
  - `src/modules/providers/providers.test.ts`: Enforces alphabetical order by name, filtering by category and city, and claiming authorization.
  - `src/modules/auth/auth.test.ts`: Tests signed cookie session persistence, role verification, and fallback to buyer.

### 1.4 Data Provenance & Benchmark GCCs / Logos
- **Data Provenance Rules (`AGENTS.md`, `data/AGENTS.md`)**:
  - Rule 1: Every number, incentive, provider, and GCC must have an authentic source URL that was opened. No source = `null`.
  - Rule 2: Every figure displayed in the UI must show its source and as-of date.
  - Rule 5: No dead buttons, lorem ipsum, fake testimonials, fake logos, fake reviews.
  - Rule 10: Money stored in integer INR; displayed with `en-IN` format (`₹... lakh` or `₹... crore`).
  - Rule 11: Copy is plain and specific. No "AI-powered", "seamless", "revolutionary".
- **Benchmark GCCs Inventory (`data/seed/gccs.json`)**:
  - 12 verified operating GCCs are currently present in `data/seed/gccs.json`:
    1. Goldman Sachs Services India (`https://www.goldmansachs.com`)
    2. SAP Labs India (`https://www.sap.com`)
    3. Microsoft India Development Center (`https://www.microsoft.com`)
    4. Novartis Healthcare India (`https://www.novartis.com`)
    5. Barclays Global Service Centre (`https://home.barclays`)
    6. Deutsche India (`https://www.db.com`)
    7. Fidelity International India (`https://www.fidelityinternational.com`)
    8. NatWest Group India (`https://www.natwestgroup.com`)
    9. Standard Chartered Global Business Services (`https://www.sc.com`)
    10. Ford Business Solutions (`https://corporate.ford.com`)
    11. Morgan Stanley Advantage Services (`https://www.morganstanley.com`)
    12. JPMorgan Chase India Technology Centre (`https://www.jpmorganchase.com`)
  - *Provenance Note*: Prompt mentions `(Google, Microsoft, Goldman Sachs, Amazon, Walmart, etc.)`. However, Google, Amazon, and Walmart are NOT present in `data/seed/gccs.json`. If displayed in the marquee ticker, the component should use the 12 operating benchmark GCCs from the database (`data/seed/gccs.json`), OR if additional GCCs like Google/Amazon/Walmart are added, they MUST be added with real source URLs meeting `data/AGENTS.md` and passing `pnpm data:validate`.
- **Partner Provider Logos Inventory (`public/logos/providers/`)**:
  - 8 partner providers are in `data/seed/providers.json`, and all 8 have authentic `.png` logos in `public/logos/providers/`:
    - `ansr-global.png` (ANSR)
    - `cbre-india.png` (CBRE India)
    - `cyril-amarchand-mangaldas.png` (Cyril Amarchand Mangaldas)
    - `deel-india.png` (Deel)
    - `jll-india.png` (JLL India)
    - `remote-india.png` (Remote)
    - `trilegal.png` (Trilegal)
    - `zinnov-advisory.png` (Zinnov)
  - `ProviderLogo.tsx` provides clean fallback to 2-letter uppercase initials on error.

---

## 2. Logic Chain

1. **Test Toolchain Linkage**: `pnpm verify` executes `pnpm typecheck && pnpm lint && pnpm test && pnpm data:validate && pnpm test:e2e`. Any frontend modification that introduces a TypeScript type error, ESLint error, console error, or broken Playwright locator causes the entire verification run to immediately abort with non-zero exit code.
2. **DOM Locator Fragility**: Playwright tests locate elements by accessible roles (`getByRole`), labels (`getByLabel`), text content (`getByText`), and exact form element IDs (`#buyerName`, `#category-filter`). Replacing semantic HTML tags (e.g. changing `h3` in city cards to `div`, removing `h1`, changing `<label>` associations, altering button text) breaks test locators.
3. **Console Hygiene Assertion**: Both `/planner` and `/inbox` tests listen to `page.on("console")` and assert `expect(consoleErrors).toEqual([])`. Uncaught JavaScript errors, Next.js hydration warnings, invalid React keys, or malformed SVG attributes will fail these tests.
4. **Data Provenance Enforcement**: `data/seed/*.json` files are validated by `scripts/validate-data.ts`. Introducing invented company data or invalid URLs fails `pnpm data:validate`. Displaying figures without their sourced popover triggers fails `planner.spec.ts`.
5. **Marketing Language Gate**: `providers.spec.ts` performs a negative text assertion on provider profile HTML for `"verified provider"`, `"trusted provider"`, and `"top provider"`. Any badge or copy containing these phrases immediately fails test 18.
6. **Accordion Animation Technique**: The prompt calls for smooth animated accordions using CSS grid-rows (`grid-rows-[0fr]` to `grid-rows-[1fr]`). Playwright asserts that `page.getByText(/Applicable State Incentives \(2\)/)` is visible. If the accordion toggle button text or state is modified, or if the container hides button text, test 13 fails.

---

## 3. UI Visual Modification Test Constraint Matrix

The following matrix defines the **mandatory rules** for frontend implementers to achieve 100% pass rate on `pnpm verify`:

| Category | Component / Page | Required Selector / Attribute / Text | Failure Mode if Broken |
| :--- | :--- | :--- | :--- |
| **Global Disclaimer** | `RootLayout` / `DemoBanner` | `role="status"` with text `"GCC Atlas Prototype — nothing is sent to anyone"` | `smoke.spec.ts:7`, `accessibility.spec.ts:108` fail |
| **Global Headers** | All Pages (`/`, `/planner`, etc.) | Each page MUST render at least one visible `h1` element | `accessibility.spec.ts:104` fails |
| **Home Hero** | `app/page.tsx` | `h1` must contain `"Data-backed planning for GCC setup in India"`; link `"Launch Setup Planner"` with `href="/planner"` | `smoke.spec.ts:16,20` fail |
| **Guide Dialog** | Header & `VisualGuide` | Button `"Open visual guide"`, Dialog `"Quick Visual Guide"`, Next `"Next step"`, Back `"Back"`, Skip `"Skip guide"`, Step texts `"Step 1 of 4"`, `"Step 2 of 4"`, Escape key listener | `guide.spec.ts:10-56` fails |
| **Planner Heading** | `app/planner/page.tsx` | Heading `"GCC Setup Planner"` | `planner.spec.ts:8` fails |
| **Planner Simulation** | `app/planner/planner-client.tsx` | Text `"Prototype Simulation"` | `planner.spec.ts:12` fails |
| **Planner Section** | `app/planner/planner-client.tsx` | Heading matching `/Ranked Candidate Cities/i` | `planner.spec.ts:16` fails |
| **Ranked Card DOM** | `app/planner/planner-client.tsx` | City title MUST be an `h3` located within the results `section` (`section h3`) | `planner.spec.ts:30,43` fails |
| **City Headings** | `app/planner/planner-client.tsx` | Headings `"Bengaluru"`, `"Hyderabad"`, `"Pune"`, `"Mumbai"`, `"Coimbatore"` | `planner.spec.ts:20-23,92` fail |
| **Planner Sliders** | `app/planner/planner-client.tsx` | `aria-label="Target Headcount"`, `aria-label="Space per seat assumption"`, `aria-label="Talent Availability Weight"`, `aria-label="Cost Efficiency Weight"` | `planner.spec.ts:34-35`, `accessibility.spec.ts:20-26` fail |
| **Office Rent Range** | `Money.tsx` | Must contain text `/Estimated Monthly Office Rent/i`, and formatted value in `span.font-mono` matching `/₹.*(lakh|crore)/` | `planner.spec.ts:53,57` fail |
| **Sourced Popover** | `SourcedValue.tsx` | Button has `aria-haspopup="dialog"`, dialog role `aria-label="Data provenance details"`, text `"Source Attribution"`, link `a[href^='https://']`, text `/As-of Date:/i`, closes on Escape | `planner.spec.ts:65-80`, `accessibility.spec.ts:35-45` fail |
| **Unranked Section** | `app/planner/planner-client.tsx` | Heading matching `/Not Ranked/i`, heading `"Coimbatore"`, text `"Missing: Tech Talent Count"` | `planner.spec.ts:88-96` fail |
| **Incentive Button** | `app/planner/planner-client.tsx` | Button text `Applicable State Incentives (${count})`, empty state text `"0 state incentives qualify for current criteria"` | `planner.spec.ts:106,118,122` fail |
| **Planner Checkboxes** | `app/planner/planner-client.tsx` | Checkbox names `"Engineering & IT"`, `"Operations"`, `"Finance & Accounting"` | `planner.spec.ts:109-111` fail |
| **Provider Heading** | `app/providers/page.tsx` | Heading `"Service Providers"` (exact) | `providers.spec.ts:21` fails |
| **Provider Links** | `app/providers/page.tsx` | Links `a[href^="/providers/"]` ordered alphabetically by provider name | `providers.spec.ts:25-31` fails |
| **Category Filter** | `app/providers/filter-bar.tsx` | `<select id="category-filter">` | `providers.spec.ts:37` fails |
| **City Filter** | `app/providers/filter-bar.tsx` | `<select id="city-filter">` | `providers.spec.ts:58` fails |
| **Empty Providers** | `app/providers/page.tsx` | Text `"No providers match these filters. Clear filters."` and link `"Clear filters"` | `providers.spec.ts:81-85` fails |
| **Banned Copy Gate** | `app/providers/[slug]/page.tsx` | Provider profile HTML MUST NOT contain `"verified provider"`, `"trusted provider"`, or `"top provider"` (case-insensitive) | `providers.spec.ts:107-109` fails |
| **Claim Badges** | `claim-button.tsx` | Button `/Claim profile/i`, `data-testid="claimed-badge"` text `"Claimed"`, `data-testid="owner-badge"` text `"Owner"` | `providers.spec.ts:122-132` fails |
| **Intro Form IDs** | `intro-form.tsx` | Inputs `#buyerName`, `#buyerCompany`, `#buyerEmail`, `#citySlug`, `#headcount`, `#function`, `#category`, `#timeline`, `#chosenProviderSlug` | `leads.spec.ts:24-34` fail |
| **Intro Submit** | `intro-form.tsx` | Button `"Submit Intro Request"`, disclaimer text `"Prototype: nothing is sent to anyone."` | `leads.spec.ts:19,35` fail |
| **Lead Confirmation** | `intro-form.tsx` | Element `data-testid="lead-routed-confirmation"` with text matching `/routed to (\d+)/` | `leads.spec.ts:38,141` fail |
| **Provider Switchers** | `inbox-client.tsx` | Buttons `data-testid="switch-provider-cbre-india"`, `data-testid="switch-provider-trilegal"` | `leads.spec.ts:43,181` fail |
| **Inbox Header** | `app/inbox/page.tsx` | Heading `"Provider Inbox"`, text `"Managing leads for [Provider]"` | `leads.spec.ts:49-51` fail |
| **Credit Balance** | `app/inbox/page.tsx` | Element `data-testid="credit-balance"` displaying numeric count and "credit(s)" | `leads.spec.ts:54,84,188` fail |
| **Offer Cards** | `app/inbox/page.tsx` | Container `data-testid^="offer-card-"` | `leads.spec.ts:60` fails |
| **Offer States** | `inbox-client.tsx` | `data-testid="buyer-contact-hidden"`, text `"Contact hidden until accepted"`, `data-testid="status-accepted"`, `data-testid="buyer-contact-revealed"`, text `"Offered (Active)"`, text `"Refunded (+1 credit)"` | `leads.spec.ts:64,76,79,102,199` fail |
| **Offer Buttons** | `inbox-client.tsx` | Buttons `"Accept (1 credit)"`, `"Flag as invalid (Refund 1 credit)"`, `"Demo: add 5 credits"` | `leads.spec.ts:70,95,202` fail |
| **Ledger Table** | `inbox-client.tsx` / `DataTable.tsx` | Region `aria-label="Credit ledger transactions"`, button `"Sort by Date"`, header `th[aria-sort]`, cells `"Lead Introduction Accepted"`, `"-1"`, `"Invalid Lead Refund"`, `"+1"` | `leads.spec.ts:90,113`, `accessibility.spec.ts:74-92` fail |
| **Console Hygiene** | All Pages | No `console.error` calls during navigation and interaction | `accessibility.spec.ts:17,71` fail |

---

## 4. Caveats

1. **Illuminative Benchmark GCC Names**: The original user request mentions `(Google, Microsoft, Goldman Sachs, Amazon, Walmart, etc.)` as examples for the marquee ticker. In the actual seed database (`data/seed/gccs.json`), Google, Amazon, and Walmart are not currently present. To adhere to Rule 1 ("Never invent data"), the ticker must either:
   - Use the 12 verified operating GCCs from `data/seed/gccs.json` (Goldman Sachs, Microsoft, SAP Labs, Barclays, Deutsche Bank, Fidelity, NatWest, Standard Chartered, Ford, Morgan Stanley, JPMorgan Chase, Novartis), OR
   - Formally add Google, Amazon, and Walmart to `data/seed/gccs.json` with verified `sourceUrl` and as-of dates, and run `pnpm data:validate && pnpm db:seed`.
2. **Reduced Motion**: All animations (`marquee`, `fade-up`, `pop-in`) must support `@media (prefers-reduced-motion: reduce)` by disabling transforms or providing static fallbacks.
3. **Database State Idempotency**: E2E tests mutate the database during tests (e.g. `remote-india` claim status, `trilegal` credits). The test hooks automatically reset these in `beforeEach`, but developers should avoid running tests concurrently on the same database file.

---

## 5. Conclusion

The verification suite in GCC Atlas is comprehensive, robust, and currently passing 100% across all 41 unit tests, data validation schemas, and 21 Playwright e2e tests. 

To maintain this 100% pass rate during the upcoming visual and interactive styling upgrade:
1. **Never rename or remove required test attributes**: All `data-testid` attributes (`lead-routed-confirmation`, `credit-balance`, `offer-card-*`, `buyer-contact-hidden`, `buyer-contact-revealed`, `status-accepted`, `claimed-badge`, `owner-badge`, `switch-provider-*`) must be preserved verbatim.
2. **Preserve accessible names and roles**: Heading levels (`h1`, `section h3`), input labels (`Target Headcount`, `Space per Seat`, `Talent Availability Weight`, `Cost Efficiency Weight`), button text (`Submit Intro Request`, `Accept (1 credit)`, `Flag as invalid (Refund 1 credit)`, `Demo: add 5 credits`, `Open visual guide`, `Sort by Date`), and dialog titles (`Data provenance details`, `Quick Visual Guide`) must not be altered.
3. **Retain form control IDs**: Form controls on `/request-intro` and `/providers` rely on exact IDs (`#buyerName`, `#buyerCompany`, `#buyerEmail`, `#citySlug`, `#headcount`, `#function`, `#category`, `#timeline`, `#chosenProviderSlug`, `#category-filter`, `#city-filter`).
4. **Enforce copy rules and negative assertions**: Provider profiles must NEVER render `"verified provider"`, `"trusted provider"`, or `"top provider"`. Disclaimer text `"GCC Atlas Prototype — nothing is sent to anyone"` must remain inside a `role="status"` element.
5. **Zero console errors**: All new animation components and CSS utilities must produce zero hydration warnings or runtime errors.

---

## 6. Verification Method

To independently verify the test suite and provenance constraints:

1. **Verify baseline test toolchain**:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm data:validate
   pnpm test:e2e
   ```
2. **Execute unified verification contract**:
   ```bash
   pnpm verify
   ```
   *Expected result*: All 41 unit tests pass, data validation passes with 0 errors, all 21 Playwright tests pass (exit code 0).
3. **Inspect data provenance seed**:
   ```bash
   pnpm tsx scripts/validate-data.ts
   ```
   *Expected result*: `Seed data validation passed with 0 errors.`
4. **Invalidation condition**: Any alteration to the selectors, IDs, ARIA labels, or copy listed in the Test Constraint Matrix will immediately trigger a test failure during `pnpm test:e2e`.
