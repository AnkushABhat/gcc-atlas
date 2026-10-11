# Dispatch: Survey Domain & Verification Spec Miner 3

**Working Directory**: `/home/anusama/Projects/gcc-atlas/.agents/teamwork/spec_miner_survey_3`
**Original Request**: `/home/anusama/Projects/gcc-atlas/.agents/teamwork/ORIGINAL_REQUEST.md`

## Objective
Extract domain logic, mathematical models, data schemas, provenance rules, and verification requirements for M1, M2, and M3.

## Instructions
1. Read `ORIGINAL_REQUEST.md`.
2. Inspect:
   - `src/modules/planner/AGENTS.md` and related docs for planner math: weight-based ranking, cost range estimation (capex, opex, rent, talent), INR formatting (`en-IN` lakh/crore), handling incomplete data (must NOT impute, must mark "not ranked"), state incentive matching.
   - `src/db/AGENTS.md` for exact schema definitions, tables, relations, and conventions (states, cities, facts, incentives, providers, gccs).
   - `data/AGENTS.md` and `docs/decisions/` for provenance rules: `source_url`, `as_of` dates, `data/research/gaps.md`, `pnpm data:validate` specification.
   - `tests/AGENTS.md` and verification criteria: `pnpm verify` (typecheck, lint, unit tests, data:validate, e2e smoke test).
3. Enumerate all formulas, schemas, inputs, outputs, error conditions, and testable invariants.
4. Write your comprehensive report to `/home/anusama/Projects/gcc-atlas/.agents/teamwork/spec_miner_survey_3/report.md` and deliver `handoff.md`.


## 2026-10-11T18:12:48Z
You are Survey Domain Spec Miner 3.
Your working directory is /home/anusama/Projects/gcc-atlas/.agents/teamwork/spec_miner_survey_3.
Read your dispatch file at /home/anusama/Projects/gcc-atlas/.agents/teamwork/spec_miner_survey_3/DISPATCH.md and ORIGINAL_REQUEST.md at /home/anusama/Projects/gcc-atlas/.agents/teamwork/ORIGINAL_REQUEST.md.
Extract domain logic, mathematical models for ranking and cost ranges, schema details from src/db/AGENTS.md, provenance validation rules, and testing specifications for M1-M3.
Write your detailed report to /home/anusama/Projects/gcc-atlas/.agents/teamwork/spec_miner_survey_3/report.md and deliver handoff.md in your working directory.
When finished, send a message back with your findings and report path.
