# Product

## Problem (one paragraph)
Firms setting up a GCC in India choose a city, entity structure and vendors with scattered, biased or stale information.
Advisors sell the outcome they advise on. Reports are static. Referrals are a sample of one.
Providers cannot reach new setups early or prove their track record.

## Users
- **Setup lead** (buyer): head of India setup at a global firm. Wants a defensible city shortlist and trusted providers. Free forever.
- **Provider** (payer): advisor, real estate or managed-office firm, EOR, legal. Pays for qualified setup leads.
- **Admin** (demo only): sees data quality.

## Prototype scope
1. Setup Planner. Inputs: headcount band, functions, optional weight sliders. Output: ranked cities with factor breakdown, office cost range, applicable state incentives, sources.
2. Provider directory: filter by category and city. Profile page. Unclaimed by default; claimable.
3. Intro request: buyer picks providers or lets the system match. Creates a lead.
4. Provider inbox: offered leads, accept or decline, credit balance, ledger.
5. Role switcher (buyer / provider / admin) instead of real login.

## Non-goals (do not build)
Real auth, payments, email or messaging, reviews and track-record verification, GCC pipeline alerts, RFP workflow,
state dashboards, talent analytics, scraping at runtime, i18n, mobile app.

## What a reviewer should see in 3 minutes
1. Planner returns a ranked list that changes sensibly when inputs change, and every number opens its source.
2. A city with missing data is shown as "not ranked: missing X", not silently scored.
3. An intro request appears in a provider's inbox; accepting it spends a credit and shows in the ledger.
4. It looks like a finished product: consistent, dense where useful, calm, no filler.

## Voice
Plain, specific, neutral. Say what the data is and how old it is. Admit gaps.
