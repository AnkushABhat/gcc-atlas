# Handoff Report — Challenger 1: Milestone M0 Provenance & Validator Adversarial Testing

## 1. Observation

### Baseline Verification
Command: `pnpm verify`
Result: Exited with code 0.
```
$ pnpm typecheck && pnpm lint && pnpm test && pnpm data:validate && pnpm test:e2e
$ tsc --noEmit
$ next lint
✔ No ESLint warnings or errors
$ vitest run
✓ tests/unit/smoke.test.ts (4 tests)
$ tsx scripts/validate-data.ts
Seed data validation passed with 0 errors.
$ playwright test
2 passed
```

### Test 1: Data Validator Adversarial Testing (`scripts/validate-data.ts`)
Tested against `pnpm data:validate`:

1. **Inverted range (`value_min > value_max`)**:
   - Fixture injected into `data/seed/facts.json`:
     `{"citySlug": "bengaluru", "metric": "office_rent_inr_sqft_month", "valueMin": 150, "valueMax": 100, "unit": "INR/sqft/month", "sourceName": "CBRE Q4 2024", "sourceUrl": "https://example.com/cbre", "asOf": "2024-12-01", "confidence": "reported"}`
   - Command: `pnpm data:validate`
   - Exit code: `1`
   - Verbatim output:
     ```
     Validation failed with 1 error(s):
       [ERROR] facts.json [0]: [
       {
         "code": "custom",
         "message": "valueMin must be less than or equal to valueMax",
         "path": [
           "valueMin"
         ]
       }
     ]
     ```

2. **HTTP (non-HTTPS) source URL**:
   - Fixture injected into `data/seed/facts.json`:
     `{"citySlug": "bengaluru", "metric": "office_rent_inr_sqft_month", "valueMin": 80, "valueMax": 120, "unit": "INR/sqft/month", "sourceName": "CBRE Q4 2024", "sourceUrl": "http://example.com/cbre", "asOf": "2024-12-01", "confidence": "reported"}`
   - Command: `pnpm data:validate`
   - Exit code: `1`
   - Verbatim output:
     ```
     Validation failed with 1 error(s):
       [ERROR] facts.json [0]: [
       {
         "code": "custom",
         "message": "sourceUrl must use HTTPS protocol",
         "path": [
           "sourceUrl"
         ]
       }
     ]
     ```

3. **Future `as_of` date**:
   - Fixture injected with YYYY-MM-DD (`"asOf": "2099-12-31"`):
     - Command: `pnpm data:validate`
     - Exit code: `1`
     - Verbatim output:
       ```
       Validation failed with 1 error(s):
         [ERROR] facts.json [0]: [
         {
           "code": "custom",
           "message": "asOf must not be in the future",
           "path": [
             "asOf"
           ]
         }
       ]
       ```
   - Fixture injected with YYYY-MM (`"asOf": "2099-12"`):
     - Command: `pnpm data:validate`
     - Exit code: `1`
     - Verbatim output:
       ```
       Validation failed with 1 error(s):
         [ERROR] facts.json [0]: [
         {
           "code": "custom",
           "message": "asOf must not be in the future",
           "path": [
             "asOf"
           ]
         }
       ]
       ```

4. **Unknown metric name**:
   - Fixture injected into `data/seed/facts.json`:
     `{"citySlug": "bengaluru", "metric": "invalid_unsupported_metric", "valueMin": 80, "valueMax": 120, "unit": "INR/sqft/month", "sourceName": "CBRE Q4 2024", "sourceUrl": "https://example.com/cbre", "asOf": "2024-12-01", "confidence": "reported"}`
   - Command: `pnpm data:validate`
   - Exit code: `1`
   - Verbatim output:
     ```
     Validation failed with 1 error(s):
       [ERROR] facts.json [0]: [
       {
         "received": "invalid_unsupported_metric",
         "code": "invalid_enum_value",
         "options": [
           "office_rent_inr_sqft_month",
           "tech_talent_count"
         ],
         "path": [
           "metric"
         ],
         "message": "Invalid enum value. Expected 'office_rent_inr_sqft_month' | 'tech_talent_count', received 'invalid_unsupported_metric'"
       }
     ]
     ```

5. **Additional stress test cases**:
   - Unknown city reference in facts (`"citySlug": "mumbai"` not in `cities.json`): rejected with `[ERROR] facts.json: Fact references unknown city 'mumbai'` (exit code 1).
   - Duplicate fact `(citySlug, metric, asOf, sourceUrl)`: rejected with `[ERROR] facts.json: Duplicate fact for (bengaluru, office_rent_inr_sqft_month, 2024-12-01, https://example.com/cbre)` (exit code 1).
   - Malformed JSON in seed file: rejected with `[ERROR] Invalid JSON in facts.json: SyntaxError: ...` (exit code 1).

### Test 2: Seed Script Idempotency (`scripts/seed.ts`)
Tested against `pnpm db:seed` using representative test data across all 6 entities (2 states, 2 cities, 3 facts, 2 incentives, 2 GCCs, 2 providers):

1. **Run 1 (Initial Seed)**:
   - Output:
     ```
     Seeding database: 2 states, 2 cities, 3 facts, 2 incentives, 2 GCCs, 2 providers.
     Granted 5 demo credits to provider 'anarock-gcc'.
     Granted 5 demo credits to provider 'nishith-desai'.
     Seeding completed successfully.
     ```
   - Row counts:
     - `states`: 2
     - `cities`: 2
     - `facts`: 3
     - `incentives`: 2
     - `gccs`: 2
     - `providers`: 2
     - `credit_ledger`: 2 (`[{"provider_slug":"anarock-gcc","delta":5,"reason":"demo_grant"},{"provider_slug":"nishith-desai","delta":5,"reason":"demo_grant"}]`)

2. **Run 2 (Identical Repeat Seed)**:
   - Output:
     ```
     Seeding database: 2 states, 2 cities, 3 facts, 2 incentives, 2 GCCs, 2 providers.
     Seeding completed successfully.
     ```
   - Notice: No new demo credits granted.
   - Row counts:
     - `states`: 2
     - `cities`: 2
     - `facts`: 3
     - `incentives`: 2
     - `gccs`: 2
     - `providers`: 2
     - `credit_ledger`: 2 (no new rows, no delta drift)

3. **Run 3 (Repeat Seed with Updated Attributes)**:
   - Modified non-key fields in seed files (state name, city name, fact note, incentive summary, gcc parent company, provider description).
   - Output: Exited with code 0.
   - Row counts: Exactly unchanged (2, 2, 3, 2, 2, 2, 2).
   - In-place updates verified:
     - State name updated to `"Karnataka State"`
     - City name updated to `"Bangalore / Bengaluru"`
     - Fact note updated to `"Updated IT corridor note"`
     - Incentive summary updated to `"Updated 30% capex reimbursement for eligible investments"`
     - GCC parent company updated to `"The Goldman Sachs Group, Inc."`
     - Provider description updated to `"Updated premium commercial office space advisory for GCCs"`
   - Credit ledger remained exactly 2 entries with delta=5 each.

### Restoration & Final Verification
- All seed files in `data/seed` (`states.json`, `cities.json`, `facts.json`, `incentives.json`, `gccs.json`, `providers.json`) restored to original `[]`.
- `local.db` re-migrated and seeded cleanly (`rm -f local.db && pnpm db:migrate && pnpm db:seed`).
- `pnpm verify` run on restored baseline: Exited 0 (TypeScript strict check, ESLint, 4 Vitest unit tests, `validate-data.ts`, 2 Playwright e2e tests all passed).

## 2. Logic Chain
1. Direct observation showed `validate-data.ts` relies on Zod schemas (`factSchema`, `httpsUrl`, `asOfDate`, and `allowedMetrics`) and cross-referential integrity loops.
2. Inverting `valueMin > valueMax` triggers the refinement at `scripts/validate-data.ts:54-57`, causing safeParse to fail and the CLI script to exit with code 1.
3. Specifying `http://` triggers the refinement at `scripts/validate-data.ts:10-12`, causing safeParse to fail and exit with code 1.
4. Specifying dates beyond `todayUtc` triggers the refinement at `scripts/validate-data.ts:17-23`, causing safeParse to fail and exit with code 1 for both YYYY-MM-DD and YYYY-MM formats.
5. Specifying an invalid metric triggers the Zod enum check on `allowedMetrics` at `scripts/validate-data.ts:44`, causing safeParse to fail with `invalid_enum_value` and exit with code 1.
6. In `scripts/seed.ts`, entities use either SQLite `onConflictDoUpdate` (states, cities, providers) or natural-key lookup and conditional `update` vs `insert` (facts, incentives, gccs). Credit ledger checks `existingLedger.length === 0` before granting credits.
7. Consequently, repeated runs of `pnpm db:seed` perform upserts rather than duplicate inserts, and grant demo credits only once, preventing row duplication and ledger drift.
8. The final restored tree passes `pnpm verify` with 0 failures, proving that test fixtures were completely cleaned up and the baseline codebase is in a sound state.

## 3. Caveats
- `pnpm lint` in the sandbox environment fails with EROFS because Next.js attempts to write cache to `.next/cache/eslint`; when executed with `BypassSandbox: true` (or in standard execution environments without sandbox file restrictions on `.next`), it passes cleanly with zero warnings or errors.
- `scripts/validate-data.ts` checks URL format and HTTPS protocol statically; it does not perform live network requests to verify HTTP 200 availability (consistent with the ADR offline / seed validation design).

## 4. Conclusion
**Verdict: APPROVE**
The implementation of `scripts/validate-data.ts` and `scripts/seed.ts` fulfills all requirements:
1. `pnpm data:validate` reliably rejects inverted ranges, non-HTTPS URLs, future dates, and unknown metrics with non-zero exit code 1.
2. `pnpm db:seed` is strictly idempotent across multiple runs, producing 0 duplicate rows and 0 credit ledger drift.
3. The baseline codebase passes all verification steps (`pnpm verify`) with 0 errors.

## 5. Verification Method
To independently reproduce:
1. Run `pnpm verify` to confirm clean baseline:
   ```bash
   pnpm verify
   ```
2. Verify invalid data rejection:
   Inject an inverted fact range into `data/seed/facts.json`:
   ```json
   [{"citySlug": "blr", "metric": "office_rent_inr_sqft_month", "valueMin": 100, "valueMax": 50, "unit": "INR", "sourceName": "Test", "sourceUrl": "https://example.com", "asOf": "2024-01-01", "confidence": "reported"}]
   ```
   Run `pnpm data:validate` and observe exit code 1. Restore `data/seed/facts.json` to `[]`.
3. Verify seed idempotency:
   Run `pnpm db:seed` consecutively twice and inspect row counts in `local.db`:
   ```bash
   pnpm db:seed
   pnpm db:seed
   ```
