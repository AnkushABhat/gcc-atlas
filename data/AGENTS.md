# data/

Seed data and research notes. This is where "zero slop" is enforced. Read fully before adding any record.

## The rule
A record exists only if you opened a source that states it. Do not use numbers recalled from model memory.
Unknown means `null` or absent, never a guess. List what you could not find in `research/gaps.md`.

## Source preference (best first)
1. Government policy documents and gazettes (state GCC / IT / ITeS policies, GIFT City authority).
2. Company filings and official press releases.
3. Published industry reports (NASSCOM, Zinnov, JLL, CBRE, Colliers, Cushman & Wakefield, Knight Frank) with a page or table you can point to.
4. Reputable business press quoting 1-3. Never forums, SEO listicles, or aggregator pages with no primary link.

## Confidence values
- `reported`: the source states the number directly for this city/metric and period.
- `derived`: computed from reported numbers. Put the calculation in `note`.
- `estimate`: the source gives a range or proxy. Say why in `note`. UI labels it "Estimate".

## Record shapes (JSON, one array per file in `seed/`)
- `states.json`: `{slug, name}`
- `cities.json`: `{slug, name, stateSlug}`
- `facts.json`: `{citySlug, metric, valueMin, valueMax, unit, sourceName, sourceUrl, asOf, confidence, note?}`
  `valueMin == valueMax` for a point value. `asOf` is the date the figure describes, `YYYY-MM-DD` or `YYYY-MM`.
- `incentives.json`: `{stateSlug, name, type, summary, minHeadcount?, maxHeadcount?, functions?, validFrom?, validTo?, sourceName, sourceUrl, asOf}`
  `type` is one of `capex_subsidy`, `opex_subsidy`, `stamp_duty`, `power`, `skilling`, `other`.
- `gccs.json`: `{name, parentCompany, parentHqCountry, citySlug, functions, status, announcedOn?, sourceName, sourceUrl, asOf}`
  `status` is `operating` or `announced`. List only if the source names the city.
- `providers.json`: `{slug, name, category, citiesServed, website, description, sourceName, sourceUrl, asOf}`
  `description` is one factual sentence taken from the firm's own public material, reworded. No superlatives.

Allowed metrics are defined in `src/modules/cities/AGENTS.md`. Do not invent new ones in data.

## Hard no
No fabricated providers, GCCs, quotes, reviews, logos, headcounts, or "approximately" numbers without a source.
No copying report text verbatim; record the figure and cite the page in `note`.
No figures older than 36 months unless nothing newer exists; then mark `estimate` and say so.

## Process
Follow `.agent/workflows/add-datapoint.md`. Then run `pnpm data:validate`.
Research notes (what you read, what you rejected) go in `research/`. Keep them short and dated.
