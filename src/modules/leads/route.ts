export interface CandidateProvider {
  slug: string;
  category: string;
  citiesServed: string[];
}

export interface RouteLeadOptions {
  category: string;
  citySlug: string;
  chosenProviderSlugs?: string[];
  candidates: CandidateProvider[];
  /** Map of provider slug to the ISO timestamp of when they were last offered any lead, or null if never offered. */
  lastOfferedAtMap: Record<string, string | null>;
}

/**
 * Pure routing algorithm for matching leads to service providers per ADR 005.
 * 
 * Rules:
 * 1. Eligible providers: same category, city in cities_served.
 * 2. If buyer specified chosen providers (max 3), offer only those that are eligible.
 * 3. Otherwise sort eligible by last_offered_at ascending (never offered first), then slug. Take at most 3.
 * 4. Fewer than 3 eligible is fine. Zero eligible returns an empty array.
 * 5. Routing NEVER reads credits or claim status.
 */
export function routeLead(options: RouteLeadOptions): string[] {
  const {
    category,
    citySlug,
    chosenProviderSlugs,
    candidates,
    lastOfferedAtMap,
  } = options;

  const normalizedCity = citySlug.trim().toLowerCase();

  // 1. Eligible providers: same category and city in cities_served
  const eligible = candidates.filter((c) => {
    if (c.category !== category) return false;
    return c.citiesServed.some((city) => city.trim().toLowerCase() === normalizedCity);
  });

  // 2. If buyer explicitly chose providers, offer only those eligible, up to 3
  if (chosenProviderSlugs && chosenProviderSlugs.length > 0) {
    const chosenSet = new Set(chosenProviderSlugs);
    const chosenEligible = eligible.filter((c) => chosenSet.has(c.slug));
    return chosenEligible.slice(0, 3).map((c) => c.slug);
  }

  // 3. Fairness rotation: sort by last_offered_at ascending (nulls first), then by slug
  eligible.sort((a, b) => {
    const lastA = lastOfferedAtMap[a.slug] ?? null;
    const lastB = lastOfferedAtMap[b.slug] ?? null;

    if (lastA === null && lastB !== null) return -1;
    if (lastA !== null && lastB === null) return 1;
    if (lastA !== null && lastB !== null) {
      const cmp = lastA.localeCompare(lastB);
      if (cmp !== 0) return cmp;
    }
    return a.slug.localeCompare(b.slug);
  });

  // Take at most 3
  return eligible.slice(0, 3).map((c) => c.slug);
}
