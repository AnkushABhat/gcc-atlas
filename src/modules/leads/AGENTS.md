# modules/leads

Leads, offers, routing, credits. This is the revenue path. ADR 005, 006.

## Interface (`index.ts`)
`createLead(input)`, `listOffersForProvider(slug)`, `acceptOffer(offerId, providerSlug)`, `declineOffer(...)`, `flagInvalid(offerId, providerSlug)`, `balance(providerSlug)`, `ledger(providerSlug)`, `demoTopUp(providerSlug)`.

## Lead = one buyer need for one service category
Fields: buyer name, company, email, city, headcount, function, category, timeline, note. One category per lead. Several needs mean several leads.

## Routing (`route.ts`, pure)
1. Eligible providers: same category, city in `cities_served`, not already offered this lead.
2. If the buyer chose providers (max 3), offer only those that are eligible.
3. Otherwise sort eligible by `last_offered_at` ascending (never offered first), then slug. Take 3.
4. Fewer than 3 eligible is fine. Zero eligible: the lead is stored with status `unmatched` and the buyer is told plainly.
Routing never reads credits or claim status.

## Offer lifecycle
`offered -> accepted | declined | expired`; `accepted -> refunded`.
- Expired: 72 hours after `offered_at`, computed at read time from the injected clock. No cron.
- Accept: one transaction. Fail with a clear error if balance < 1. Otherwise insert ledger -1 (`lead_accepted`) and set `accepted`. This reveals buyer contact.
- Buyer contact is hidden until accepted.
- `flagInvalid`: only on an accepted offer, once, within 72h of acceptance. Inserts ledger +1 (`refund_invalid`), status `refunded`.
- `demoTopUp`: +5 credits (`demo_topup`). The button is labeled "Demo: add 5 credits". Seeded providers start with 5 (`demo_grant`).
- Price is flat: 1 credit per accepted lead. No other pricing logic in the prototype.

## Tests (`*.test.ts`, inline fixtures)
Cap of 3; fairness rotates across successive leads; unmatched; chosen providers respected; accept with 0 credits fails; double accept fails; expiry; refund once only; ledger sum equals balance; contact hidden before accept.
