# ADR 001: Stack: Next.js, TypeScript, Drizzle, libSQL

**Context.** The prototype must run locally with zero setup and deploy as a link a reviewer can open.

**Decision.** Next.js App Router, TypeScript strict, Tailwind, Drizzle ORM, libSQL (file database locally, Turso optionally when deployed), Zod, Vitest, Playwright, pnpm. Server actions for mutations. No separate API service.

**Consequence.** One deployable and no network boundary to maintain. Server actions are not a public API; if one is needed later, add route handlers then.
