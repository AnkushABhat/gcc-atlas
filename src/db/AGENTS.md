# src/db/

Drizzle schema and migrations. Schema decisions: ADR 002, 003.

## Tables
| Table | Key columns |
|---|---|
| `states` | slug (pk), name |
| `cities` | slug (pk), name, state_slug (fk). No numeric data columns. |
| `facts` | id, city_slug (fk), metric, value_min, value_max, unit, source_name, source_url, as_of, confidence, note. Source columns NOT NULL. |
| `incentives` | id, state_slug (fk), name, type, summary, min/max_headcount, functions (json), valid_from/to, source_name, source_url, as_of |
| `gccs` | id, name, parent_company, parent_hq_country, city_slug (fk), functions (json), status, announced_on, source_name, source_url, as_of |
| `providers` | slug (pk), name, category, cities_served (json), website, description, source_*, as_of, claimed_at |
| `leads` | id, buyer_name, buyer_company, buyer_email, city_slug, headcount, function, category, timeline, note, created_at |
| `lead_offers` | id, lead_id (fk), provider_slug (fk), status, offered_at, resolved_at. Unique (lead_id, provider_slug). |
| `credit_ledger` | id, provider_slug (fk), delta, reason, lead_offer_id?, created_at. Append-only. |

## Constraints
- Balance = SUM(delta) over `credit_ledger`. Never store a balance column. Never UPDATE or DELETE ledger rows.
- Slugs are primary keys for cities, states and providers. Leads, offers, ledger use `crypto.randomUUID()`.
- Generate migrations with `drizzle-kit generate`. Never hand-edit generated SQL.
- Seeding is idempotent (upsert by natural key). Running it twice changes nothing.
- Only `repo.ts` files in modules import from this directory.
