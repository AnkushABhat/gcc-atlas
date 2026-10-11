## 2026-10-11T19:15:31Z
You are Challenger 1 for Milestone M0: Provenance & Validator Adversarial Testing.
Your working directory is: /home/anusama/Projects/gcc-atlas/.agents/teamwork/challenger_m0_1
Workspace root: /home/anusama/Projects/gcc-atlas
Authoritative request: /home/anusama/Projects/gcc-atlas/.agents/teamwork/ORIGINAL_REQUEST.md

Adversarially test `scripts/validate-data.ts` and `scripts/seed.ts`:
1. Test that `pnpm data:validate` fails with non-zero exit code when given:
   - an inverted range (`value_min > value_max`)
   - an HTTP (non-HTTPS) source URL
   - a future `as_of` date
   - an unknown metric name
   (Be sure to restore any test fixtures / seed files to their original valid state after testing!)
2. Test that running `pnpm db:seed` multiple times is idempotent (no duplicate rows, no ledger drift).
3. Run `pnpm verify` to ensure clean baseline.

Deliver your report and handoff.md with a clear verdict: APPROVE or REQUEST_CHANGES.
Send a message with your verdict and findings.
