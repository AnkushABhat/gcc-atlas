---
description: Keep module docs accurate after code changes
---
1. List changed directories: `git diff --name-only`.
2. For each directory with an `AGENTS.md`, compare it to the code: exported interface, constraints, tests listed.
3. Fix the doc when it is wrong. Delete rules that no longer affect decisions. Add a rule only if a fresh session would get it wrong without it.
4. Keep root `AGENTS.md` under 100 lines.
