import { eq, asc } from "drizzle-orm";
import { db } from "../../db/client";
import * as schema from "../../db/schema";
import { requireRole } from "../auth";

export const PROVIDER_CATEGORIES = [
  "setup_advisor",
  "real_estate",
  "eor",
  "legal",
  "recruiter",
] as const;

export type ProviderCategory = (typeof PROVIDER_CATEGORIES)[number];

export interface Provider {
  slug: string;
  name: string;
  category: ProviderCategory;
  citiesServed: string[];
  website: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  asOf: string;
  claimedAt: string | null;
}

export interface ListProvidersOptions {
  category?: ProviderCategory;
  citySlug?: string;
}

/**
 * Lists providers filtered optionally by category and/or citySlug.
 * Strictly ordered alphabetically by name per ADR 005.
 * Never ordered by credits, payment, or claim status.
 */
export async function listProviders(
  options: ListProvidersOptions = {}
): Promise<Provider[]> {
  const query = db
    .select()
    .from(schema.providers)
    .orderBy(asc(schema.providers.name));

  const rows = await query;

  let results: Provider[] = rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    category: row.category as ProviderCategory,
    citiesServed: row.cities_served ?? [],
    website: row.website,
    description: row.description,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    asOf: row.as_of,
    claimedAt: row.claimed_at,
  }));

  if (options.category) {
    results = results.filter((p) => p.category === options.category);
  }

  if (options.citySlug) {
    const targetCity = options.citySlug.toLowerCase();
    results = results.filter((p) =>
      p.citiesServed.some((c) => c.toLowerCase() === targetCity)
    );
  }

  // Ensure deterministic alphabetical order by name ascending
  results.sort((a, b) => a.name.localeCompare(b.name));

  return results;
}

/**
 * Retrieves a single provider by slug.
 */
export async function getProvider(slug: string): Promise<Provider | null> {
  const rows = await db
    .select()
    .from(schema.providers)
    .where(eq(schema.providers.slug, slug))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    slug: row.slug,
    name: row.name,
    category: row.category as ProviderCategory,
    citiesServed: row.cities_served ?? [],
    website: row.website,
    description: row.description,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    asOf: row.as_of,
    claimedAt: row.claimed_at,
  };
}

/**
 * Claims a provider profile for the current demo user.
 * Requires the provider demo role for this slug per modules/providers AGENTS.md.
 * Idempotent: sets claimed_at if null; leaves existing timestamp intact.
 */
export async function claimProvider(slug: string): Promise<Provider> {
  // Enforce demo authorization guard
  await requireRole("provider", { providerSlug: slug });

  const existing = await getProvider(slug);
  if (!existing) {
    throw new Error(`Provider not found: ${slug}`);
  }

  if (!existing.claimedAt) {
    const now = new Date().toISOString();
    await db
      .update(schema.providers)
      .set({ claimed_at: now })
      .where(eq(schema.providers.slug, slug));

    existing.claimedAt = now;
  }

  return existing;
}
