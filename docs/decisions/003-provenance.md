# ADR 003: Provenance enforced by schema

**Context.** Credibility is the product. Unsourced numbers are the main failure mode when agents generate data.

**Decision.** All sourced numbers live in a `facts` table with NOT NULL `source_url`, `as_of` and `confidence`. Cities have no numeric columns. The UI renders a source chip from the fact row.

**Consequence.** Adding a metric means adding rows, not columns. A number cannot be stored or displayed without a source.
