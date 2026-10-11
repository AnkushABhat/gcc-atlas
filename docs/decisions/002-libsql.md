# ADR 002: Database: libSQL (SQLite-compatible)

**Context.** Data is small, relational and read-heavy. Reviewers must run it without installing a database server.

**Decision.** libSQL via Drizzle. Local file `local.db`. Production can point at Turso with the same schema. No Postgres-only features.

**Consequence.** Migrations stay portable. Write concurrency is limited, which is acceptable for a prototype.
