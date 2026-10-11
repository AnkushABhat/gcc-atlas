---
description: Full verification before reporting any task done
---
1. Run `pnpm verify`. Fix every failure. Do not skip or weaken a test to pass.
2. Run `pnpm dev`. In the browser, complete: Planner -> change a weight -> open a source popover -> request an intro -> switch to provider -> accept -> check the ledger.
3. Check the browser console and network tab. Zero errors.
4. Confirm each changed directory's `AGENTS.md` still matches the code. Update it if not.
5. Report: what changed, commands run with results, anything unverified. Do not claim a check you did not run.
