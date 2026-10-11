# ADR 004: No imputation in ranking

**Context.** Filling missing values with averages makes cities with gaps look better or worse than the data supports.

**Decision.** The planner ranks only cities that have data for every factor the user selected. Others are listed as "not ranked: missing <factor>".

**Consequence.** Fewer ranked cities when data is thin. That is honest and shows where data work is needed.
