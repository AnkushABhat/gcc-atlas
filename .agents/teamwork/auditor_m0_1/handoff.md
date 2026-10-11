# Forensic Audit & Handoff Report — Milestone M0

## Forensic Audit Report

**Work Product**: Milestone M0 Application Scaffold & Verification Toolchain  
**Profile**: General Project  
**Integrity Mode**: Development (per `ORIGINAL_REQUEST.md`)  
**Verdict**: CLEAN  

### Phase Results
- **Hardcoded test results**: PASS — Ripgrep scan across `src/`, `scripts/`, `tests/` found zero dummy returns, mocked test passes, or hardcoded expected outputs.
- **Facade implementations**: PASS — Genuine libSQL database client (`src/db/client.ts`), full 9-table schema definitions (`src/db/schema.ts`), authentic Drizzle migrations (`src/db/migrations/0000_cheerful_madame_web.sql`), and real Zod validation logic (`scripts/validate-data.ts`).
- **Pre-populated artifacts**: PASS — No stale result caches or pre-generated test logs; only dynamic Playwright artifacts generated during active testing.
- **Dependency audit**: PASS — Uses dependencies explicitly permitted by ADR 001 (`next`, `react`, `react-dom`, `@libsql/client`, `drizzle-orm`, `zod`, `vitest`, `@playwright/test`, `tailwindcss`).
- **Behavioral verification**: PASS — Independent runs of `pnpm db:migrate`, `pnpm db:seed`, `pnpm verify`, and `pnpm build` all executed with exit code 0.

---

## 1. Observation

1. **Repository Layout and Toolchain Configuration**:
   - `package.json` lines 6-19 define standard scripts:
     - `"lint": "next lint"`
     - `"typecheck": "tsc --noEmit"`
     - `"test": "vitest run"`
     - `"test:e2e": "playwright test"`
     - `"db:migrate": "tsx scripts/migrate.ts"`
     - `"db:seed": "tsx scripts/seed.ts"`
     - `"data:validate": "tsx scripts/validate-data.ts"`
     - `"verify": "pnpm typecheck && pnpm lint && pnpm test && pnpm data:validate && pnpm test:e2e"`

2. **Database Client & Schema Integrity (`src/db/client.ts` & `src/db/schema.ts`)**:
   - `src/db/client.ts` lines 8-13 instantiate a genuine `@libsql/client` connection:
     ```ts
     export const rawClient = createClient({ url, authToken });
     export const db = drizzle(rawClient, { schema });
     ```
   - Direct execution via Node verified connection to `local.db`:
     ```
     Tables in local.db:
      - __drizzle_migrations
      - cities
      - credit_ledger
      - facts
      - gccs
      - incentives
      - lead_offers
      - leads
      - providers
      - sqlite_sequence
      - states
     ```
   - `src/db/schema.ts` lines 16-22 enforces ADR 003: `cities` table contains only `slug`, `name`, `state_slug` with zero numeric columns.
   - `src/db/schema.ts` lines 28-48 enforces ADR 003: `facts` table defines `source_name`, `source_url`, `as_of`, and `confidence` with `.notNull()`.
   - `src/db/schema.ts` lines 158-173 defines append-only `credit_ledger` with integer `delta`.

3. **Migration & DB Creation (`src/db/migrations/` & `scripts/migrate.ts`)**:
   - Migration file `src/db/migrations/0000_cheerful_madame_web.sql` contains genuine DDL statements creating all 9 tables, indexes (`idx_facts_city_metric`, `idx_gccs_city`, `idx_lead_offers_provider`, `idx_credit_ledger_provider`), and foreign keys.
   - Tested applying migrations to a fresh database from scratch (`DATABASE_URL="file:test-migration-audit.db" pnpm db:migrate`); completed cleanly with exit code 0 and created all 9 tables.

4. **Zod Schema Validation (`scripts/validate-data.ts`)**:
   - Contains strict Zod schemas for all 6 entities with custom refinements:
     - `httpsUrl`: validates HTTPS protocol (`url.startsWith("https://")`).
     - `asOfDate`: validates `YYYY-MM-DD` or `YYYY-MM` and rejects future dates (`dateStr <= todayUtc`).
     - `factSchema`: validates `valueMin <= valueMax` and enumerated allowed metrics.
     - Cross-referential validation across cities, states, facts, incentives, GCCs, and providers.
   - Adversarial probe during testing introduced an invalid future date (`"asOf": "2099-12"` in `data/seed/facts.json`), and `scripts/validate-data.ts` immediately rejected it with exit code 1:
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

5. **Test Assertions (`tests/unit/smoke.test.ts` & `tests/e2e/smoke.spec.ts`)**:
   - `tests/unit/smoke.test.ts` lines 6-52 executes runtime Drizzle introspection using `getTableColumns(schema.cities)` and `getTableColumns(schema.facts)`, validating that city columns are non-numeric, fact source columns are NOT NULL, and credit ledger has delta.
   - `tests/e2e/smoke.spec.ts` lines 4-22 tests the running Next.js App Router server, checking that the persistent disclaimer banner per ADR 006 is rendered with role `status`, and home page navigation works.

6. **Toolchain Execution (`pnpm verify` & `pnpm build`)**:
   - `pnpm verify` output:
     ```
     $ pnpm typecheck && pnpm lint && pnpm test && pnpm data:validate && pnpm test:e2e
     $ tsc --noEmit
     $ next lint
     ✔ No ESLint warnings or errors
     $ vitest run
      ✓ tests/unit/smoke.test.ts (4 tests) 17ms
      Test Files 1 passed (1)
           Tests 4 passed (4)
     $ tsx scripts/validate-data.ts
     Seed data validation passed with 0 errors.
     $ playwright test
     [WebServer] $ next dev
     Running 2 tests using 2 workers
       ✓  1 …ome page smoke test › renders home page title and link to planner (1.9s)
       ✓  2 …page smoke test › renders prototype disclaimer banner per ADR 006 (1.9s)
       2 passed (16.8s)
     ```
     Exit code: 0.
   - `pnpm build` output:
     ```
     $ next build
        ▲ Next.js 15.5.27
        Creating an optimized production build ...
      ✓ Compiled successfully in 3.7s
        Linting and checking validity of types
        Collecting page data
      ✓ Generating static pages (4/4)
        Collecting build traces
        Finalizing page optimization
     ```
     Exit code: 0.

---

## 2. Logic Chain

1. Per `ORIGINAL_REQUEST.md`, Milestone M0 requires establishing a functioning Next.js, TypeScript strict, Tailwind, Drizzle ORM, libSQL, Vitest, and Playwright foundation where `pnpm install`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm dev`, and `pnpm verify` work out of the box (Observation 1).
2. Direct inspection of `src/db/client.ts` and dynamic `@libsql/client` execution against `local.db` confirms a genuine libSQL database connection without mocks or dummy drivers (Observation 2).
3. The schema definition in `src/db/schema.ts` and SQL migration in `src/db/migrations/0000_cheerful_madame_web.sql` implement all 9 required tables and strictly enforce architectural invariants from ADR 003 (zero numeric columns on `cities`, non-null provenance columns on `facts`) (Observations 2 & 3).
4. Applying migrations on a clean test database proves that database creation and schema provisioning are authentic and reproducible from scratch (Observation 3).
5. The data validation pipeline in `scripts/validate-data.ts` uses real Zod parsing and was verified empirically to fail with a non-zero exit code when given invalid data (Observation 4).
6. Unit tests inspect real runtime table definitions and end-to-end tests interact with a live browser rendering the application shell (Observation 5).
7. Independent execution of the unified verification command `pnpm verify` and production build `pnpm build` both exit with 0, confirming that the toolchain is healthy and uncompromised (Observation 6).
8. Therefore, the Milestone M0 implementation satisfies all integrity criteria with zero prohibited patterns.

---

## 3. Caveats

- In sandbox execution environments where the workspace root is mounted read-only, commands that generate disk caches (`.next/cache/eslint/`) require appropriate write permissions (e.g. running outside sandbox restrictions).
- Milestone M0 implements the structural schemas, validator, and seed loaders; actual research figures for 6 Indian cities are deferred to Milestone M2 per `docs/build-plan.md`.

---

## 4. Conclusion

The Milestone M0 work product is authentic, genuine, and free of shortcuts or integrity violations. The implementation strictly abides by `AGENTS.md`, ADR 001 through ADR 006, and `src/db/AGENTS.md`.  
**Final Forensic Verdict**: **CLEAN**.

---

## 5. Verification Method

To independently reproduce this forensic audit:
1. Verify database schema and migrations:
   ```bash
   pnpm db:migrate
   pnpm db:seed
   sqlite3 local.db ".tables"
   ```
2. Verify provenance validator:
   ```bash
   pnpm data:validate
   ```
3. Run the full verification suite:
   ```bash
   pnpm verify
   ```
4. Verify production build:
   ```bash
   pnpm build
   ```
All commands must exit with code 0.
