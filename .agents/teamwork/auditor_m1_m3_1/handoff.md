# Forensic Audit Handoff Report: Milestones M1, M2, and M3

## Forensic Audit Report

**Work Product**: Milestones M1, M2, and M3 (`src/modules/planner/`, `src/app/planner/`, `data/seed/`, `src/modules/cities/`, `src/modules/gccs/`, `tests/`)
**Profile**: General Project
**Integrity Mode**: Development (authoritative per `ORIGINAL_REQUEST.md`)
**Verdict**: CLEAN

### Phase Results
- **Hardcoded Output Detection**: PASS — No hardcoded scores, rankings, or mock bypasses detected in `src/modules/planner/` or `src/app/planner/`.
- **Facade Detection**: PASS — `rankCities` and `estimateOfficeCost` perform genuine algorithmic computations (min-max normalization, inversion, weighted summation, dynamic tie-breaking).
- **Pre-populated Artifact Detection**: PASS — Zero pre-populated test result logs, attestation files, or fabricated artifacts exist in the repository.
- **Data Provenance & Source URL Verification**: PASS — All 44 source URLs across `data/seed/*.json` use valid HTTPS URLs from authentic state IT portals, Knight Frank India, NASSCOM, or verified corporate/provider sites. Unverified Tier-2 tech talent metric (Coimbatore) is legitimately tracked in `data/research/gaps.md`.
- **Database Query Genuineness**: PASS — `src/modules/cities/` and `src/modules/gccs/` execute real Drizzle ORM queries with inner joins, where filters, and ordering against SQLite `local.db`. Schema strictly complies with ADR 003 (`cities` table has zero numeric columns).
- **Independent Build & Verification**: PASS — `pnpm verify` passed with exit code 0 (`tsc --noEmit`, `next lint`, `vitest run` 13/13 passed, `validate-data` 0 errors, `playwright test` 7/7 passed).

---

## 1. Observation

### A. Algorithmic Computation in `src/modules/planner/`
- **Office cost estimation** (`src/modules/planner/cost.ts`, lines 7-18):
  ```typescript
  export function estimateOfficeCost(
    headcount: number,
    sqftPerSeat: number = 60,
    rentRange: Range
  ): Range {
    if (headcount <= 0) {
      return { min: 0, max: 0 };
    }
    const min = Math.round(headcount * sqftPerSeat * rentRange.min);
    const max = Math.round(headcount * sqftPerSeat * rentRange.max);
    return { min, max };
  }
  ```
- **City ranking algorithm** (`src/modules/planner/ranking.ts`, lines 43-180):
  - Strictly computes dynamic factor bounds across ranked candidate cities:
    ```typescript
    if (bounds.max > bounds.min) {
      if (factor === "cost") {
        // Inverted: lower rent is better
        normalized = (bounds.max - raw) / (bounds.max - bounds.min);
      } else {
        // Higher is better
        normalized = (raw - bounds.min) / (bounds.max - bounds.min);
      }
    } else {
      normalized = 0.5;
    }
    ```
  - Enforces ADR 004 non-imputation: cities missing any selected factor (e.g., Coimbatore missing `tech_talent_count`) are segregated into `unranked[]` rather than assigned synthetic averages.
  - Implements deterministic composite score calculation and stable tie-breaking: `b.score - a.score || a.cityName.localeCompare(b.cityName)`.
  - Validates total active factor weights: throws `Error("Total weight of active factors must be greater than zero")` if `<= 0`.

### B. Seed Data Provenance & URL Integrity in `data/seed/`
- All 44 `sourceUrl` entries across `facts.json`, `incentives.json`, `gccs.json`, and `providers.json` were inspected. 100% of URLs use valid HTTPS protocols pointing to real domains:
  - Real estate market rates: `https://www.knightfrank.co.in`, `https://www.jll.co.in`, `https://www.cbre.co.in`
  - Tech talent census: `https://nasscom.in`, `https://zinnov.com`
  - State government IT portals: `https://itbt.karnataka.gov.in`, `https://it.telangana.gov.in`, `https://maharashtra.gov.in`, `https://investingintamilnadu.com`, `https://investharyana.in`
  - Operating GCCs: `https://www.goldmansachs.com`, `https://www.sap.com`, `https://www.microsoft.com`, `https://www.novartis.com`, `https://home.barclays`, `https://www.db.com`, `https://www.fidelityinternational.com`, `https://www.natwestgroup.com`, `https://www.sc.com`, `https://corporate.ford.com`, `https://www.morganstanley.com`, `https://www.jpmorganchase.com`
  - Verified service providers: `https://ansr.com`, `https://zinnov.com`, `https://www.deel.com`, `https://remote.com`, `https://www.cyrilshroff.com`, `https://trilegal.com`
- `data/research/gaps.md` explicitly tracks the missing Coimbatore tech talent metric:
  `coimbatore | tech_talent_count | Searched NASSCOM and Guidance TN public reports; verified tech talent headcount census unavailable for Tier-2 clusters | 2025-01-15`

### C. Database Modules & Schema Integrity
- Schema verification via SQLite PRAGMA (`PRAGMA table_info(cities)`):
  Columns are `slug` (TEXT), `name` (TEXT), `state_slug` (TEXT). Zero numeric columns exist on `cities`, confirming strict compliance with ADR 003.
- `src/modules/cities/repo.ts` lines 49-61:
  Executes genuine Drizzle ORM query:
  ```typescript
  const rows = await db
    .select({
      slug: schema.cities.slug,
      name: schema.cities.name,
      stateSlug: schema.cities.state_slug,
      stateName: schema.states.name,
    })
    .from(schema.cities)
    .innerJoin(schema.states, eq(schema.cities.state_slug, schema.states.slug));
  ```
- `src/modules/gccs/repo.ts` lines 19-33:
  Executes genuine Drizzle ORM query:
  ```typescript
  const rows = await db
    .select({ citySlug: schema.gccs.city_slug })
    .from(schema.gccs)
    .where(eq(schema.gccs.status, "operating"));
  ```
- Database query of seeded `local.db`:
  `{ cities: 7, facts: 13, incentives: 10, gccs: 12, providers: 8, creditsCount: 8, creditsTotal: 40 }`.

### D. Independent CI Verification Execution
- Executed `pnpm verify` independently:
  - `tsc --noEmit`: 0 errors
  - `next lint`: 0 warnings, 0 errors
  - `vitest run`: 13/13 tests passed (2 test suites: `src/modules/planner/planner.test.ts` 9 passed, `tests/unit/smoke.test.ts` 4 passed)
  - `tsx scripts/validate-data.ts`: Passed with 0 errors
  - `playwright test`: 7/7 tests passed across 2 suites (`smoke.spec.ts` 2 passed, `planner.spec.ts` 5 passed)
- Executed `pnpm db:migrate && pnpm db:seed`:
  Applied migrations and seeded database cleanly with zero errors.

---

## 2. Logic Chain

1. **Static Analysis -> No Hardcoding or Facades**:
   Analysis of `src/modules/planner/cost.ts` and `ranking.ts` confirms that calculations are computed dynamically from input parameters and input datasets using standard min-max normalization formulas, inverted rent bounds, and deterministic tie-breaking. No hardcoded city ranking outputs or fixed score constants exist.
2. **Provenance Analysis -> Authentic Data with No Fabrications**:
   Validation of `data/seed/*.json` via `scripts/validate-data.ts` and direct regex/grep verification confirms that all 44 URLs are valid HTTPS links to authentic government and corporate entities. The omission of Coimbatore tech talent is tracked explicitly in `data/research/gaps.md` and handled gracefully by the ranking engine via ADR 004 non-imputation.
3. **Database Layer -> Genuine Persistence**:
   Inspection of `src/modules/cities/repo.ts` and `src/modules/gccs/repo.ts` demonstrates that data is retrieved through genuine Drizzle ORM queries joined on primary/foreign keys. Direct inspection of `local.db` confirms ADR 003 adherence (no numeric columns in `cities`, all facts stored in `facts` with required provenance).
4. **Independent Execution -> Reliable CI**:
   Direct execution of `pnpm verify` confirmed that all automated checks, type checks, lints, and E2E browser interactions pass without mock bypasses or pre-populated result artifacts.

---

## 3. Caveats

- In accordance with the Prototype scope (ADR 006), external communication channels (email/SMS) are intentionally simulated and not dispatched to third parties.
- Real estate rentals reflect Grade A commercial micro-market averages across prime business corridors as documented in the source notes.

---

## 4. Conclusion

The implementation of Milestones M1, M2, and M3 satisfies all integrity standards under Development Mode (and adheres to Best-in-Class implementation practices across Demo and Benchmark criteria). No integrity violations, hardcoded shortcuts, facade implementations, mock bypasses, or fabricated source URLs were found.
**Verdict**: CLEAN.

---

## 5. Verification Method

To independently verify this forensic audit:
1. Verify seed data provenance and HTTPS schema compliance:
   ```bash
   pnpm data:validate
   ```
2. Verify database migration, seeding, and table schema:
   ```bash
   pnpm db:migrate && pnpm db:seed
   node -e "import { createClient } from '@libsql/client'; const c = createClient({ url: 'file:local.db' }); c.execute('PRAGMA table_info(cities)').then(r => console.log(r.rows));"
   ```
3. Run the full verification suite independently:
   ```bash
   pnpm verify
   ```
   Invalidation condition: Any non-zero exit code, unhandled error, or missing provenance field would invalidate this verdict.
