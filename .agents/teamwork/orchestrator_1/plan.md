# Project Plan: GCC Atlas Foundation (M0 - M3)

## Objective
Build and verify the core foundation of GCC Atlas across Milestones M0 through M3 per ORIGINAL_REQUEST.md, following the Project Orchestration Pattern with Dual Track (Implementation Track + E2E Testing Track).

## Milestones & Work Breakdown
1. **Survey Phase (Current)**:
   - Deploy 3 parallel Explorers / Spec Miners to investigate codebase docs (`docs/architecture.md`, `docs/build-plan.md`, `docs/decisions/`, `AGENTS.md`, and existing files).
   - Formulate merged Feature Inventory and interface contracts in `PROJECT.md`.
2. **Decomposition & Delegation**:
   - Establish `PROJECT.md` with complete Feature Inventory, Milestones, and Interface Contracts.
   - Dual-Track dispatch:
     - E2E Testing Orchestrator (Opaque-box test infrastructure and Tiers 1-4 test suites).
     - Sub-orchestrators for Implementation Milestones:
       - M0: Application Scaffold & Verification Toolchain
       - M1 & M2: Database Schema, Seed Loader, and Provenance Validator
       - M3: Setup Planner Domain Engine & User Interface
       - Final Milestone: Pass 100% E2E tests + Adversarial Coverage Hardening (Tier 5)
3. **Execution & Gate Review**:
   - Each sub-orchestrator executes Explorer -> Worker -> Reviewer -> Challenger -> Auditor -> Gate loop.
   - Strict adherence to zero-tolerance integrity policy (Forensic Auditor clean verdict required).
4. **Final Acceptance**:
   - Full verification via `pnpm verify`.
   - Complete manual verification in running app.
   - Handoff & victory claim back to parent orchestrator.
