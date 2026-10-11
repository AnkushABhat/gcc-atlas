import { eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import * as schema from "../../db/schema";

export interface Gcc {
  id: number;
  name: string;
  parentCompany: string;
  parentHqCountry: string;
  citySlug: string;
  functions: string[];
  status: "operating" | "announced";
  announcedOn: string | null;
  sourceName: string;
  sourceUrl: string;
  asOf: string;
}

export async function countOperatingByCity(): Promise<Record<string, number>> {
  const rows = await db
    .select({
      citySlug: schema.gccs.city_slug,
    })
    .from(schema.gccs)
    .where(eq(schema.gccs.status, "operating"));

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.citySlug] = (counts[row.citySlug] ?? 0) + 1;
  }

  return counts;
}

export async function listByCity(citySlug: string, status?: "operating" | "announced"): Promise<Gcc[]> {
  const query = db
    .select()
    .from(schema.gccs)
    .where(
      status
        ? and(eq(schema.gccs.city_slug, citySlug), eq(schema.gccs.status, status))
        : eq(schema.gccs.city_slug, citySlug)
    );

  const rows = await query;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    parentCompany: r.parent_company,
    parentHqCountry: r.parent_hq_country,
    citySlug: r.city_slug,
    functions: r.functions,
    status: r.status as "operating" | "announced",
    announcedOn: r.announced_on,
    sourceName: r.source_name,
    sourceUrl: r.source_url,
    asOf: r.as_of,
  }));
}
