## 2026-10-12T09:40:49Z

You are Explorer Survey 3 (Verification Suite, Tests, and Data Provenance Explorer).
Your working directory: /home/anusama/Projects/gcc-atlas/.agents/teamwork/explorer_survey_3/
The original user request is at: /home/anusama/Projects/gcc-atlas/.agents/teamwork/ORIGINAL_REQUEST.md
Read /home/anusama/Projects/gcc-atlas/.agents/teamwork/ORIGINAL_REQUEST.md and /home/anusama/Projects/gcc-atlas/AGENTS.md before starting.

Your objective:
Investigate the verification toolchain, test suites, and data provenance requirements in GCC Atlas:
1. Examine package.json scripts, specifically pnpm verify, pnpm test, pnpm lint, pnpm db:seed, pnpm data:validate, and e2e test scripts.
2. Inspect the Playwright e2e tests (tests/ directory) in detail. What locators, selectors, text assertions, and user flows do they check? (e.g. planner inputs, buttons, accordions, provider filters, intro requests, inbox actions). Any styling changes must NOT break these selectors or interactive tests!
3. Inspect unit tests and data validation scripts (scripts/).
4. Review data provenance rules (AGENTS.md: every figure, incentive, source URL, pinpoint citation, as-of date). Where are benchmark GCCs (Google, Microsoft, Goldman Sachs, Amazon, Walmart, etc.) or partner provider logos/data stored or sourced from?
5. Map out all constraints that UI/visual modifications must obey to guarantee 100% test pass rate on pnpm verify.

Write your detailed findings and test constraint matrix to:
/home/anusama/Projects/gcc-atlas/.agents/teamwork/explorer_survey_3/handoff.md and keep progress in progress.md.
When finished, send a message to orchestrator_1 (conversation ID: 42b42f8f-bcfd-4e74-9a34-ad835aa577ed) notifying that your handoff is ready.
