import { eq, and, inArray, desc } from "drizzle-orm";
import { db } from "../../db/client";
import * as schema from "../../db/schema";

export interface CityWithState {
  slug: string;
  name: string;
  stateSlug: string;
  stateName: string;
}

export interface Fact {
  id: number;
  citySlug: string;
  metric: string;
  valueMin: number;
  valueMax: number;
  unit: string;
  sourceName: string;
  sourceUrl: string;
  asOf: string;
  confidence: "reported" | "derived" | "estimate";
  note: string | null;
}

export interface Incentive {
  id: number;
  stateSlug: string;
  name: string;
  type: string;
  summary: string;
  minHeadcount: number | null;
  maxHeadcount: number | null;
  functions: string[] | null;
  validFrom: string | null;
  validTo: string | null;
  sourceName: string;
  sourceUrl: string;
  asOf: string;
}

export interface ListIncentivesOptions {
  stateSlug?: string;
  headcount?: number;
  functions?: string[];
  on?: string;
}

export async function listCities(): Promise<CityWithState[]> {
  const rows = await db
    .select({
      slug: schema.cities.slug,
      name: schema.cities.name,
      stateSlug: schema.cities.state_slug,
      stateName: schema.states.name,
    })
    .from(schema.cities)
    .innerJoin(schema.states, eq(schema.cities.state_slug, schema.states.slug));

  return rows;
}

export async function getCity(slug: string): Promise<CityWithState | null> {
  const rows = await db
    .select({
      slug: schema.cities.slug,
      name: schema.cities.name,
      stateSlug: schema.cities.state_slug,
      stateName: schema.states.name,
    })
    .from(schema.cities)
    .innerJoin(schema.states, eq(schema.cities.state_slug, schema.states.slug))
    .where(eq(schema.cities.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}

export async function getFacts(citySlug: string, metrics?: string[]): Promise<Fact[]> {
  const query = db
    .select()
    .from(schema.facts)
    .where(
      metrics && metrics.length > 0
        ? and(eq(schema.facts.city_slug, citySlug), inArray(schema.facts.metric, metrics))
        : eq(schema.facts.city_slug, citySlug)
    )
    .orderBy(desc(schema.facts.as_of));

  const rows = await query;

  // Deduplicate to only keep the most recent per metric per ADR 003 / modules/cities AGENTS.md
  const latestByMetric = new Map<string, Fact>();
  for (const row of rows) {
    if (!latestByMetric.has(row.metric)) {
      latestByMetric.set(row.metric, {
        id: row.id,
        citySlug: row.city_slug,
        metric: row.metric,
        valueMin: row.value_min,
        valueMax: row.value_max,
        unit: row.unit,
        sourceName: row.source_name,
        sourceUrl: row.source_url,
        asOf: row.as_of,
        confidence: row.confidence as "reported" | "derived" | "estimate",
        note: row.note,
      });
    }
  }

  return Array.from(latestByMetric.values());
}

export async function getAllLatestFacts(metrics?: string[]): Promise<Record<string, Record<string, Fact>>> {
  const query = db
    .select()
    .from(schema.facts)
    .where(metrics && metrics.length > 0 ? inArray(schema.facts.metric, metrics) : undefined)
    .orderBy(desc(schema.facts.as_of));

  const rows = await query;
  const result: Record<string, Record<string, Fact>> = {};

  for (const row of rows) {
    if (!result[row.city_slug]) {
      result[row.city_slug] = {};
    }
    const cityMap = result[row.city_slug]!;
    if (!cityMap[row.metric]) {
      cityMap[row.metric] = {
        id: row.id,
        citySlug: row.city_slug,
        metric: row.metric,
        valueMin: row.value_min,
        valueMax: row.value_max,
        unit: row.unit,
        sourceName: row.source_name,
        sourceUrl: row.source_url,
        asOf: row.as_of,
        confidence: row.confidence as "reported" | "derived" | "estimate",
        note: row.note,
      };
    }
  }

  return result;
}

export async function listIncentives(options?: ListIncentivesOptions): Promise<Incentive[]> {
  const rows = await db.select().from(schema.incentives);

  return rows
    .map((r) => ({
      id: r.id,
      stateSlug: r.state_slug,
      name: r.name,
      type: r.type,
      summary: r.summary,
      minHeadcount: r.min_headcount,
      maxHeadcount: r.max_headcount,
      functions: r.functions,
      validFrom: r.valid_from,
      validTo: r.valid_to,
      sourceName: r.source_name,
      sourceUrl: r.source_url,
      asOf: r.as_of,
    }))
    .filter((inc) => {
      if (options?.stateSlug && inc.stateSlug !== options.stateSlug) {
        return false;
      }

      if (options?.headcount !== undefined) {
        if (inc.minHeadcount !== null && options.headcount < inc.minHeadcount) {
          return false;
        }
        if (inc.maxHeadcount !== null && options.headcount > inc.maxHeadcount) {
          return false;
        }
      }

      if (options?.functions && options.functions.length > 0 && inc.functions && inc.functions.length > 0) {
        const matchesFunction = inc.functions.some((f) => options.functions!.includes(f));
        if (!matchesFunction) {
          return false;
        }
      }

      if (options?.on) {
        if (inc.validFrom && options.on < inc.validFrom) {
          return false;
        }
        if (inc.validTo && options.on > inc.validTo) {
          return false;
        }
      }

      return true;
    });
}
