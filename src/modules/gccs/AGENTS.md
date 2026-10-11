# modules/gccs

Read-only records of operating and announced GCCs. Used for the planner's ecosystem factor and the city detail list.

## Interface (`index.ts`)
`countOperatingByCity()`, `listByCity(citySlug, status?)`.

## Constraints
- Ecosystem factor = number of `operating` GCCs in the city in our data. The UI must say "in our data" so it is not read as the true city total.
- No page of its own in the prototype. Shown inside planner city detail only.
- Records are seeded from `data/seed/gccs.json`. Nothing writes to this table at runtime.
