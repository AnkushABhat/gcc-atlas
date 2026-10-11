---
description: Research and add a sourced record to data/seed
---
1. Read `data/AGENTS.md`. Identify the record type and its shape.
2. Search for a primary source (policy, filing, report). Open the page. Do not rely on search snippets or memory.
3. Record the figure exactly as stated: unit, period (`asOf`), geography. Do not convert or round unless you set `confidence: derived` and write the calculation in `note`.
4. Add the record to the right file in `data/seed/`. Include `sourceName` and the exact `sourceUrl` you opened.
5. Re-open the URL once more and confirm the figure is on that page.
6. If you cannot find a source, add one line to `data/research/gaps.md` and move on. Never fill the gap.
7. Run `pnpm data:validate`, then `pnpm db:seed`, and look at the record in the app.
