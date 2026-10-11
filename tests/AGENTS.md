# tests/

Playwright end-to-end tests. Unit tests live next to the code as `*.test.ts`.

## Rules
- Tests never read `data/seed/`. Real data changes as research improves. Use `tests/fixtures/` (small, hand-written, obviously fake names like "Fixture City") loaded into a separate test database.
- Fixture data is never imported by app code.
- Each test starts from a freshly seeded test database.
- Do not mock the database or modules in e2e.

## Flows that must pass
1. Planner: enter headcount, see ranked cities; move a weight slider, order changes; open a source popover and see the URL and as-of date.
2. Planner: a fixture city missing a selected metric appears under "not ranked" with the reason.
3. Revenue path: buyer submits an intro request, switch to provider, offer appears with contact hidden, accept, credit drops by 1, contact visible, ledger shows the entry.
4. Cap and fairness: three requests in a row rotate offers; no lead goes to more than 3 providers.
5. Accept with zero credits is refused with a clear message; demo top-up fixes it.
