# scripts/

- `seed.ts`: loads `data/seed/*.json` into the database. Idempotent. Validates with the same Zod schemas as `validate-data.ts`. Also grants each provider 5 `demo_grant` credits if the ledger is empty for it.
- `validate-data.ts` (`pnpm data:validate`): fails the build on any of these.
  - Schema violations in any seed file.
  - A fact, incentive, GCC or provider without an https `sourceUrl`, `sourceName` or valid `asOf`.
  - `asOf` in the future. `valueMin > valueMax`. Unknown metric. Unknown city or state slug.
  - Duplicate (city, metric, asOf, sourceUrl).
  - Warns (does not fail) on `asOf` older than 24 months and on `estimate` facts.
- `check-docs.sh`: CI reminder. Emits a warning when files in a directory with an `AGENTS.md` changed but the `AGENTS.md` did not.
- Link liveness is not checked in CI (network flakiness). Use `.agent/workflows/add-datapoint.md` step 5 manually.
