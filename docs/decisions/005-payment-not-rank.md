# ADR 005: Payment never affects rank or order

**Context.** The trust layer is the long-term moat. Pay-to-rank destroys it.

**Decision.** Directory order and planner order never read credits or payment status. Payment only buys lead access. Lead routing uses fit (category, city, size band) first, then fairness (least recently offered).

**Consequence.** Providers cannot buy visibility. Revenue depends on lead quality instead.
