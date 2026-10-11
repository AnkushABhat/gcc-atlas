# modules/providers

Provider records, directory queries, demo claim flow. ADR 005.

## Interface (`index.ts`)
`listProviders({category?, citySlug?})`, `getProvider(slug)`, `claimProvider(slug)`.

## Categories (closed set)
`setup_advisor`, `real_estate`, `eor`, `legal`, `recruiter`.

## Rules
- Directory order is alphabetical by name. Nothing else. Never by credits, claim status or recency.
- "Claimed" means a demo user took ownership. Never write "verified", "trusted" or "top" in the UI. Verification is out of scope.
- A profile shows only: name, category, cities served, website, one-line description, source chip, claimed badge. Empty track-record sections are not rendered.
- `claimProvider` requires the provider demo role for that slug (`requireRole`). Idempotent.
- Seeded providers are real firms. They are never contacted. See ADR 006.
