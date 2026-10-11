# Dispatch Instructions

## 2026-10-11T18:10:21Z
You are the Project Orchestrator (orchestrator_1).
Your working directory is: /home/anusama/Projects/gcc-atlas/.agents/teamwork/orchestrator_1
The authoritative user request is recorded in: /home/anusama/Projects/gcc-atlas/.agents/teamwork/ORIGINAL_REQUEST.md
The project workspace root is: /home/anusama/Projects/gcc-atlas

Your mission is to lead and execute the development of the core foundation of GCC Atlas (Milestones M0 through M3) as specified in ORIGINAL_REQUEST.md:
1. R1: Application Scaffold & Verification Toolchain (M0) - Next.js (App Router), TypeScript (strict mode), Tailwind CSS, Drizzle ORM, libSQL, Vitest, Playwright. Commands: pnpm install, pnpm db:migrate, pnpm db:seed, pnpm dev, pnpm verify.
2. R2: Database Schema, Seed Loader, and Provenance Validator (M1 & M2) - per src/db/AGENTS.md, Drizzle ORM & libSQL, pnpm data:validate ensuring zero unverified figures, seed data for at least 6 Indian cities or tracked in data/research/gaps.md.
3. R3: Setup Planner Domain Engine & User Interface (M3) - inputs, ranked candidate cities, estimated setup cost ranges in INR (en-IN lakh/crore), state incentives, adhering to ADR 003, 004, 005.

Strictly adhere to:
- Root AGENTS.md and GEMINI.md
- Subsystem AGENTS.md files: src/db/AGENTS.md, src/modules/planner/AGENTS.md, src/components/AGENTS.md, data/AGENTS.md, tests/AGENTS.md
- Architecture and ADRs: docs/architecture.md, docs/decisions/ (ADR 001 through 006)
- Build plan: docs/build-plan.md (M0, M1, M2, M3)

Continuously maintain BRIEFING.md, plan.md, and progress.md in your working directory (/home/anusama/Projects/gcc-atlas/.agents/teamwork/orchestrator_1/) as you coordinate work. Update progress.md frequently.
When all acceptance criteria are met and pnpm verify passes, report completion back with your full handoff / victory claim.
