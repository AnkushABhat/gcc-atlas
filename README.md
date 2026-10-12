# GCC Atlas

> Single source of truth and interactive decision tool for companies setting up Global Capability Centres (GCCs) in India.

GCC Atlas is a production-grade prototype designed for GCC leaders evaluating Indian cities for their technology and operations hubs. It pairs an empirical, weight-driven Setup Planner with a curated provider directory and a fair lead routing marketplace.

---

## Key Capabilities

1. **Setup Planner**:
   - Multi-criteria city ranking based on customizable weights (Talent, Cost, Ecosystem, Incentives).
   - Dynamic monthly office cost estimation formatted in INR (`en-IN` lakhs and crores).
   - Real-time state incentive matching based on headcount and functional scope.
   - **Zero Imputation (ADR 004)**: Candidate cities with incomplete metrics are explicitly grouped as "Not Ranked" rather than imputed with arbitrary averages.

2. **Auditable Data Provenance (ADR 003)**:
   - **Zero invented data**: Every rental rate, talent metric, incentive, and GCC benchmark includes an auditable HTTPS source URL and ISO 8601 as-of date.
   - Interactive popovers in the UI display full attribution for every number.
   - Verified via strict automated schema validation (`pnpm data:validate`).

3. **Curated Provider Directory & Profiles**:
   - Comprehensive directory of setup advisors, real estate firms, employer of record (EOR), and legal partners across top GCC hubs.
   - Filter by specialty category and operating cities.
   - Interactive profile claim flow with verified owner badges.

4. **Lead Routing & Provider Inbox (ADR 005 & ADR 006)**:
   - GCC leaders can request introductions directly from their customized setup plan.
   - **Capped at 3 Providers**: Leads are routed to at most 3 eligible providers using a fair rotation algorithm. Payment never influences organic city rankings.
   - **Credit Ledger**: Providers spend 1 credit to accept a lead and unlock leader contact details. If a lead is invalid, a full refund (+1 credit) is provided within 72 hours.
   - Interactive demo switcher enables evaluating both Buyer and Provider personas without authentication friction.

5. **Editorial Design & Accessibility**:
   - Calm editorial aesthetic adhering to strict typography (400 `font-normal` and 500 `font-medium`), semantic color tokens, and sentence-case copy.
   - Full keyboard accessibility, sticky header `DataTable`, route loading skeletons (`loading.tsx`), and error boundaries (`error.tsx`).

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode, zero `any`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with semantic CSS variables
- **Database & ORM**: [libSQL / SQLite](https://github.com/tursodatabase/libsql) with [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/) at all system boundaries
- **Testing**: [Vitest](https://vitest.dev/) for domain unit tests, [Playwright](https://playwright.dev/) for end-to-end browser workflows

---

## Quickstart

### Prerequisites
- Node.js >= 20
- pnpm >= 9

### Installation & Run

```bash
# 1. Install dependencies
pnpm install

# 2. Run database migrations and seed verified research data (creates local.db)
pnpm db:migrate && pnpm db:seed

# 3. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. No external environment variables or external API keys are required for local operation.

---

## Verification & Testing

Run the full verification suite to execute type checking, linting, unit tests, provenance checks, and end-to-end browser tests:

```bash
pnpm verify
```

This runs:
- `pnpm typecheck`: Strict TypeScript checking (`tsc --noEmit`)
- `pnpm lint`: Next.js ESLint rules
- `pnpm test`: 41 Vitest unit tests covering planner ranking, cost calculations, lead routing, credit ledger, and auth cookies
- `pnpm data:validate`: Verifies all JSON seed facts and incentives have valid HTTPS sources and as-of dates
- `pnpm test:e2e`: 20 Playwright browser tests covering accessibility, the full lead cycle, provider claim flow, and planner interactivity

---

## Reviewer Walkthrough (3-Minute Script)

For evaluators and reviewers testing the application end-to-end, follow the step-by-step walkthrough script in [`docs/demo.md`](docs/demo.md):

1. **Step 1: Setup Planner** (`/planner`): Adjust headcount and priority sliders; view live re-ranking and click provenance popovers to see source URLs.
2. **Step 2: Provider Directory** (`/providers`): Filter by category and city, inspect provider profiles, and claim a profile.
3. **Step 3: Intro Request** (`/request-intro`): Submit a setup request with desired services and candidate cities.
4. **Step 4: Provider Inbox & Credit Ledger** (`/inbox`): Switch to Provider role using the demo banner, accept the offer (spends 1 credit to reveal contact info), and inspect the transparent credit ledger.

---

## Repository Structure

```
├── data/                  # Verified seed files (cities, states, facts, incentives, providers, gccs)
│   ├── research/          # Research notes and tracked data gaps
│   └── seed/              # Strict JSON seed datasets
├── docs/                  # Architecture, product specs, build plan, and reviewer guides
│   ├── decisions/         # Architecture Decision Records (ADR 001 - ADR 006)
│   ├── architecture.md    # System design & module boundaries
│   ├── product.md         # Product specification & scope boundaries
│   ├── build-plan.md      # Milestones M0 through M6
│   └── demo.md            # 3-minute reviewer demo script
├── scripts/               # Migration, seed loader, and data provenance validator
├── src/
│   ├── app/               # Next.js App Router pages, loading skeletons, and error boundaries
│   ├── components/        # Shared UI components (DataTable, DemoBanner, SourcedValue, Money, FactorBar)
│   ├── db/                # Drizzle schema, SQLite client, and migrations
│   └── modules/           # Framework-free domain modules
│       ├── auth/          # Lightweight demo role session management
│       ├── cities/        # City queries and fact joins
│       ├── gccs/          # Existing GCC benchmarks
│       ├── leads/         # Lead creation, capped routing (max 3), and credit ledger
│       ├── planner/       # Multi-criteria ranking and cost estimation engine
│       └── providers/     # Provider directory and profile claim logic
└── tests/                 # Playwright E2E suites and unit tests
```

---

## Architecture Decision Records (ADRs)

Key architectural choices are documented in [`docs/decisions/`](docs/decisions/):
- **ADR 001**: Next.js App Router, TypeScript strict, Tailwind CSS, Drizzle ORM, libSQL.
- **ADR 002**: libSQL / local SQLite database for zero-config local reproduction.
- **ADR 003**: Auditable data provenance — every figure must have a source URL and as-of date.
- **ADR 004**: No imputation — cities with missing facts are displayed as "Not Ranked" rather than guessed.
- **ADR 005**: Strict separation between payments and city rankings — monetization never influences organic recommendations.
- **ADR 006**: Simulated demo mode — transparent disclosure that prototype sends no external emails/SMS.
