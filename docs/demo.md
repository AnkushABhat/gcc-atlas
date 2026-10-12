# GCC Atlas — 3-Minute Reviewer Demo Script

This script walks through the end-to-end prototype in 3 minutes.
Every figure shown is backed by a verified source URL and as-of date.
Prototype disclaimer: nothing is sent to anyone.

---

## 0:00 – 0:30 | Setup Planner: Inputs & Evidence-Backed Ranking

1. **Start at Home (`/`)**:
   - Notice the persistent prototype disclaimer banner in the top header.
   - Click **Launch Setup Planner** (navigates to `/planner`).

2. **Explore Candidate Rankings**:
   - The default plan configures **100 seats** across Engineering & Operations with balanced weights (Talent 35, Cost 35, Ecosystem 15, Incentives 15).
   - Candidate cities are ranked into a composite score (0–100) with a segmented **FactorBar** showing each factor's point contribution.
   - Point out that every metric row is a **SourcedValue**:
     - Click or press Enter on Bengaluru's office lease rent (e.g. `₹85 – ₹160 / sq ft / mo`).
     - A popover opens showing the primary source name (Knight Frank India), verified HTTPS source URL, as-of date (2024-H1), confidence level (Reported), and methodology note.
     - Press **Escape** or click outside to dismiss the popover.

3. **Dynamic Re-Ranking**:
   - Move the **Cost Efficiency (Lower Rent)** slider up from 35 to 80.
   - Observe the live re-ranking: lower-rent cities (Pune, Hyderabad) rise in rank relative to higher-rent hubs.
   - Notice that parameters update the URL query string (`?headcount=100&w_cost=80...`) for easy sharing.

---

## 0:30 – 1:00 | Non-Imputation & State Incentives

1. **Not Ranked Section (ADR 004)**:
   - Scroll below the ranked cities to the **Not Ranked** section.
   - Point out cities with missing primary research facts (e.g. Ahmedabad, Jaipur).
   - Emphasize adherence to **ADR 004**: missing numbers are never imputed with synthetic averages or hidden silently. They are explicitly marked with what fact is missing.

2. **Policy Incentives Engine**:
   - Expand **Applicable State Incentives** under Bengaluru (Karnataka).
   - Increase headcount to **300 seats** and select **Corporate (Finance / HR / Legal)**.
   - Watch the applicable incentive count update dynamically based on employee threshold and functional policy eligibility.
   - Every incentive includes a verified link to the official state policy document.

---

## 1:00 – 1:45 | Service Provider Directory & Profile Claim

1. **Navigate to Providers (`/providers`)**:
   - View the directory of setup advisors, real estate brokers, and corporate legal counsel.
   - Providers are ordered strictly alphabetically. Payment never influences directory rank (ADR 005).

2. **Filter Providers**:
   - Filter by **Category: Real Estate** &rarr; directory narrows to firms like CBRE India.
   - Click **CBRE India** to open their profile (`/providers/cbre-india`).
   - Profile shows overview, verified cities served, external website, and primary provenance source.

3. **Simulate Claim Flow**:
   - Click **Claim profile (Demo)**.
   - The profile updates immediately with a **Claimed** badge and **Owner** badge.

---

## 1:45 – 2:30 | Request Intro: Fair Routing (ADR 005 & ADR 006)

1. **Navigate to Request Intro (`/request-intro`)**:
   - As a buyer setting up a GCC, submit an introduction request:
     - Name: `Sarah Jenkins`
     - Company: `Apex FinTech UK`
     - Work Email: `sarah@apexfintech.co.uk`
     - City: `Bengaluru`
     - Headcount: `150`
     - Category: `Setup Advisor`
     - Specific Provider: Leave empty to test **fair rotation**.
   - Click **Submit Intro Request**.

2. **Fair Match Confirmation**:
   - Confirmation displays: request was routed to at most **3 matched providers**.
   - Explain the fairness rotation: candidate providers are ranked by `last_offered_at` ascending, ensuring leads are evenly distributed over time.

---

## 2:30 – 3:00 | Provider Inbox: Masked Contacts, Credits & Refund

1. **Switch Demo Role to Provider**:
   - In the header **Demo mode** dropdown, switch to **ANSR Global** (or visit `/inbox`).
   - Header shows: *Managing leads for ANSR Global*.
   - View **Available credits** (starts at 5 demo credits).

2. **Contact Masking**:
   - Find the newly received offer card for `Apex FinTech UK`.
   - Buyer work email is masked: *"Contact hidden until accepted. Spend 1 credit to reveal full buyer contact details."*

3. **Accept Lead (-1 Credit)**:
   - Click **Accept (1 credit)**.
   - Balance drops from 5 to **4 credits**.
   - Buyer contact details are instantly revealed: `Sarah Jenkins · sarah@apexfintech.co.uk`.
   - Scroll to the **Credit ledger**: an append-only entry `Lead Introduction Accepted` is recorded with delta `-1`.

4. **Invalid Lead Refund Path (+1 Credit)**:
   - Within the 72-hour window, click **Flag as invalid (Refund 1 credit)**.
   - Offer updates to `Refunded (+1 credit)`.
   - Credit balance restores to **5 credits**.
   - Credit ledger appends an audit row `Invalid Lead Refund` with delta `+1`.

5. **Top-Up**:
   - Click **Demo: add 5 credits** to simulate purchasing credits (balance updates to 10).

---

## Key Guarantees Verified

- **No invented data**: Every metric carries a verified source URL and as-of date.
- **Strict non-imputation**: Cities with missing facts are displayed under "Not Ranked".
- **Zero pay-to-rank**: Directory ordering and planner ranking are 100% independent from provider credits.
- **Append-only credit ledger**: Total balance is mathematically identical to `SUM(delta)`.
- **Keyboard accessible & calm editorial aesthetic**: Fast, light-theme research terminal design.
