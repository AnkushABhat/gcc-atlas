import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { eq, and } from "drizzle-orm";
import { db, rawClient } from "../src/db/client";
import * as schema from "../src/db/schema";
import {
  validateData,
  StateSeed,
  CitySeed,
  FactSeed,
  IncentiveSeed,
  GccSeed,
  ProviderSeed,
} from "./validate-data";

async function runSeed() {
  const seedDir = path.resolve(process.cwd(), "data/seed");
  console.log(`Validating seed data from ${seedDir}...`);

  const { errors, warnings } = validateData(seedDir);
  if (warnings.length > 0) {
    for (const w of warnings) {
      console.warn(`  [WARN] ${w}`);
    }
  }

  if (errors.length > 0) {
    console.error(`Seed aborted due to ${errors.length} validation error(s):`);
    for (const err of errors) {
      console.error(`  [ERROR] ${err}`);
    }
    process.exit(1);
  }

  function readJson<T>(filename: string): T[] {
    const filePath = path.join(seedDir, filename);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T[];
  }

  const statesData = readJson<StateSeed>("states.json");
  const citiesData = readJson<CitySeed>("cities.json");
  const factsData = readJson<FactSeed>("facts.json");
  const incentivesData = readJson<IncentiveSeed>("incentives.json");
  const gccsData = readJson<GccSeed>("gccs.json");
  const providersData = readJson<ProviderSeed>("providers.json");

  console.log(`Seeding database: ${statesData.length} states, ${citiesData.length} cities, ${factsData.length} facts, ${incentivesData.length} incentives, ${gccsData.length} GCCs, ${providersData.length} providers.`);

  // 1. States (upsert by slug)
  for (const s of statesData) {
    await db
      .insert(schema.states)
      .values({
        slug: s.slug,
        name: s.name,
      })
      .onConflictDoUpdate({
        target: schema.states.slug,
        set: { name: s.name },
      });
  }

  // 2. Cities (upsert by slug)
  for (const c of citiesData) {
    await db
      .insert(schema.cities)
      .values({
        slug: c.slug,
        name: c.name,
        state_slug: c.stateSlug,
      })
      .onConflictDoUpdate({
        target: schema.cities.slug,
        set: {
          name: c.name,
          state_slug: c.stateSlug,
        },
      });
  }

  // 3. Facts (natural key: city_slug, metric, as_of, source_url)
  for (const f of factsData) {
    const existing = await db
      .select()
      .from(schema.facts)
      .where(
        and(
          eq(schema.facts.city_slug, f.citySlug),
          eq(schema.facts.metric, f.metric),
          eq(schema.facts.as_of, f.asOf),
          eq(schema.facts.source_url, f.sourceUrl)
        )
      );

    if (existing.length > 0 && existing[0]) {
      await db
        .update(schema.facts)
        .set({
          value_min: f.valueMin,
          value_max: f.valueMax,
          unit: f.unit,
          source_name: f.sourceName,
          confidence: f.confidence,
          note: f.note ?? null,
          pinpoint: f.pinpoint ?? null,
        })
        .where(eq(schema.facts.id, existing[0].id));
    } else {
      await db.insert(schema.facts).values({
        city_slug: f.citySlug,
        metric: f.metric,
        value_min: f.valueMin,
        value_max: f.valueMax,
        unit: f.unit,
        source_name: f.sourceName,
        source_url: f.sourceUrl,
        as_of: f.asOf,
        confidence: f.confidence,
        note: f.note ?? null,
        pinpoint: f.pinpoint ?? null,
      });
    }
  }

  // 4. Incentives (natural key: state_slug, name)
  for (const inc of incentivesData) {
    const existing = await db
      .select()
      .from(schema.incentives)
      .where(
        and(
          eq(schema.incentives.state_slug, inc.stateSlug),
          eq(schema.incentives.name, inc.name)
        )
      );

    if (existing.length > 0 && existing[0]) {
      await db
        .update(schema.incentives)
        .set({
          type: inc.type,
          summary: inc.summary,
          min_headcount: inc.minHeadcount ?? null,
          max_headcount: inc.maxHeadcount ?? null,
          functions: inc.functions ?? null,
          valid_from: inc.validFrom ?? null,
          valid_to: inc.validTo ?? null,
          source_name: inc.sourceName,
          source_url: inc.sourceUrl,
          as_of: inc.asOf,
          pinpoint: inc.pinpoint ?? null,
        })
        .where(eq(schema.incentives.id, existing[0].id));
    } else {
      await db.insert(schema.incentives).values({
        state_slug: inc.stateSlug,
        name: inc.name,
        type: inc.type,
        summary: inc.summary,
        min_headcount: inc.minHeadcount ?? null,
        max_headcount: inc.maxHeadcount ?? null,
        functions: inc.functions ?? null,
        valid_from: inc.validFrom ?? null,
        valid_to: inc.validTo ?? null,
        source_name: inc.sourceName,
        source_url: inc.sourceUrl,
        as_of: inc.asOf,
        pinpoint: inc.pinpoint ?? null,
      });
    }
  }

  // 5. GCCs (natural key: city_slug, name)
  for (const gcc of gccsData) {
    const existing = await db
      .select()
      .from(schema.gccs)
      .where(
        and(
          eq(schema.gccs.city_slug, gcc.citySlug),
          eq(schema.gccs.name, gcc.name)
        )
      );

    if (existing.length > 0 && existing[0]) {
      await db
        .update(schema.gccs)
        .set({
          parent_company: gcc.parentCompany,
          parent_hq_country: gcc.parentHqCountry,
          functions: gcc.functions,
          status: gcc.status,
          announced_on: gcc.announcedOn ?? null,
          source_name: gcc.sourceName,
          source_url: gcc.sourceUrl,
          as_of: gcc.asOf,
        })
        .where(eq(schema.gccs.id, existing[0].id));
    } else {
      await db.insert(schema.gccs).values({
        name: gcc.name,
        parent_company: gcc.parentCompany,
        parent_hq_country: gcc.parentHqCountry,
        city_slug: gcc.citySlug,
        functions: gcc.functions,
        status: gcc.status,
        announced_on: gcc.announcedOn ?? null,
        source_name: gcc.sourceName,
        source_url: gcc.sourceUrl,
        as_of: gcc.asOf,
      });
    }
  }

  // 6. Providers (upsert by slug)
  for (const p of providersData) {
    await db
      .insert(schema.providers)
      .values({
        slug: p.slug,
        name: p.name,
        category: p.category,
        cities_served: p.citiesServed,
        website: p.website,
        description: p.description,
        source_name: p.sourceName,
        source_url: p.sourceUrl,
        as_of: p.asOf,
      })
      .onConflictDoUpdate({
        target: schema.providers.slug,
        set: {
          name: p.name,
          category: p.category,
          cities_served: p.citiesServed,
          website: p.website,
          description: p.description,
          source_name: p.sourceName,
          source_url: p.sourceUrl,
          as_of: p.asOf,
        },
      });

    // Check credit ledger: grant 5 demo credits if ledger is empty for this provider
    const existingLedger = await db
      .select()
      .from(schema.creditLedger)
      .where(eq(schema.creditLedger.provider_slug, p.slug));

    if (existingLedger.length === 0) {
      await db.insert(schema.creditLedger).values({
        id: crypto.randomUUID(),
        provider_slug: p.slug,
        delta: 5,
        reason: "demo_grant",
        lead_offer_id: null,
        created_at: new Date().toISOString(),
      });
      console.log(`Granted 5 demo credits to provider '${p.slug}'.`);
    }
  }

  console.log("Seeding completed successfully.");
  rawClient.close();
}

runSeed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
