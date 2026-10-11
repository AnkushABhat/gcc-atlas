import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const todayUtc = new Date().toISOString().slice(0, 10);

const httpsUrl = z
  .string()
  .url()
  .refine((url) => url.startsWith("https://"), {
    message: "sourceUrl must use HTTPS protocol",
  });

const asOfDate = z
  .string()
  .regex(/^\d{4}-\d{2}(-\d{2})?$/, "asOf must be in YYYY-MM-DD or YYYY-MM format")
  .refine((val) => {
    // If YYYY-MM, compare as YYYY-MM-01 or ensure prefix <= today's YYYY-MM
    const dateStr = val.length === 7 ? `${val}-01` : val;
    return dateStr <= todayUtc;
  }, {
    message: "asOf must not be in the future",
  });

export const stateSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
});

export const citySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  stateSlug: z.string().min(1),
});

export const allowedMetrics = [
  "office_rent_inr_sqft_month",
  "tech_talent_count",
] as const;

export const factSchema = z
  .object({
    citySlug: z.string().min(1),
    metric: z.enum(allowedMetrics),
    valueMin: z.number(),
    valueMax: z.number(),
    unit: z.string().min(1),
    sourceName: z.string().min(1),
    sourceUrl: httpsUrl,
    asOf: asOfDate,
    confidence: z.enum(["reported", "derived", "estimate"]),
    note: z.string().optional(),
  })
  .refine((data) => data.valueMin <= data.valueMax, {
    message: "valueMin must be less than or equal to valueMax",
    path: ["valueMin"],
  });

export const incentiveSchema = z.object({
  stateSlug: z.string().min(1),
  name: z.string().min(1),
  type: z.enum([
    "capex_subsidy",
    "opex_subsidy",
    "stamp_duty",
    "power",
    "skilling",
    "other",
  ]),
  summary: z.string().min(1),
  minHeadcount: z.number().int().positive().optional(),
  maxHeadcount: z.number().int().positive().optional(),
  functions: z.array(z.string()).optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  sourceName: z.string().min(1),
  sourceUrl: httpsUrl,
  asOf: asOfDate,
});

export const gccSchema = z.object({
  name: z.string().min(1),
  parentCompany: z.string().min(1),
  parentHqCountry: z.string().min(1),
  citySlug: z.string().min(1),
  functions: z.array(z.string()).min(1),
  status: z.enum(["operating", "announced"]),
  announcedOn: z.string().optional(),
  sourceName: z.string().min(1),
  sourceUrl: httpsUrl,
  asOf: asOfDate,
});

export const providerSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.enum([
    "setup_advisor",
    "real_estate",
    "eor",
    "legal",
    "recruiter",
  ]),
  citiesServed: z.array(z.string()),
  website: httpsUrl,
  description: z.string().min(1),
  sourceName: z.string().min(1),
  sourceUrl: httpsUrl,
  asOf: asOfDate,
});

export type StateSeed = z.infer<typeof stateSchema>;
export type CitySeed = z.infer<typeof citySchema>;
export type FactSeed = z.infer<typeof factSchema>;
export type IncentiveSeed = z.infer<typeof incentiveSchema>;
export type GccSeed = z.infer<typeof gccSchema>;
export type ProviderSeed = z.infer<typeof providerSchema>;

export function validateData(seedDir: string) {
  const errors: string[] = [];
  const warnings: string[] = [];

  function loadJson<T>(filename: string): T[] {
    const filePath = path.join(seedDir, filename);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing seed file: ${filename}`);
      return [];
    }
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    } catch (e) {
      errors.push(`Invalid JSON in ${filename}: ${String(e)}`);
      return [];
    }
  }

  const rawStates = loadJson<unknown>("states.json");
  const rawCities = loadJson<unknown>("cities.json");
  const rawFacts = loadJson<unknown>("facts.json");
  const rawIncentives = loadJson<unknown>("incentives.json");
  const rawGccs = loadJson<unknown>("gccs.json");
  const rawProviders = loadJson<unknown>("providers.json");

  const parsedStates: StateSeed[] = [];
  rawStates.forEach((item, idx) => {
    const res = stateSchema.safeParse(item);
    if (!res.success) {
      errors.push(`states.json [${idx}]: ${res.error.message}`);
    } else {
      parsedStates.push(res.data);
    }
  });

  const parsedCities: CitySeed[] = [];
  rawCities.forEach((item, idx) => {
    const res = citySchema.safeParse(item);
    if (!res.success) {
      errors.push(`cities.json [${idx}]: ${res.error.message}`);
    } else {
      parsedCities.push(res.data);
    }
  });

  const parsedFacts: FactSeed[] = [];
  rawFacts.forEach((item, idx) => {
    const res = factSchema.safeParse(item);
    if (!res.success) {
      errors.push(`facts.json [${idx}]: ${res.error.message}`);
    } else {
      parsedFacts.push(res.data);
    }
  });

  const parsedIncentives: IncentiveSeed[] = [];
  rawIncentives.forEach((item, idx) => {
    const res = incentiveSchema.safeParse(item);
    if (!res.success) {
      errors.push(`incentives.json [${idx}]: ${res.error.message}`);
    } else {
      parsedIncentives.push(res.data);
    }
  });

  const parsedGccs: GccSeed[] = [];
  rawGccs.forEach((item, idx) => {
    const res = gccSchema.safeParse(item);
    if (!res.success) {
      errors.push(`gccs.json [${idx}]: ${res.error.message}`);
    } else {
      parsedGccs.push(res.data);
    }
  });

  const parsedProviders: ProviderSeed[] = [];
  rawProviders.forEach((item, idx) => {
    const res = providerSchema.safeParse(item);
    if (!res.success) {
      errors.push(`providers.json [${idx}]: ${res.error.message}`);
    } else {
      parsedProviders.push(res.data);
    }
  });

  // Cross-reference integrity checks
  const stateSlugs = new Set(parsedStates.map((s) => s.slug));
  const citySlugs = new Set(parsedCities.map((c) => c.slug));

  for (const city of parsedCities) {
    if (!stateSlugs.has(city.stateSlug)) {
      errors.push(`cities.json: City '${city.slug}' references unknown state '${city.stateSlug}'`);
    }
  }

  for (const fact of parsedFacts) {
    if (!citySlugs.has(fact.citySlug)) {
      errors.push(`facts.json: Fact references unknown city '${fact.citySlug}'`);
    }
  }

  for (const inc of parsedIncentives) {
    if (!stateSlugs.has(inc.stateSlug)) {
      errors.push(`incentives.json: Incentive '${inc.name}' references unknown state '${inc.stateSlug}'`);
    }
  }

  for (const gcc of parsedGccs) {
    if (!citySlugs.has(gcc.citySlug)) {
      errors.push(`gccs.json: GCC '${gcc.name}' references unknown city '${gcc.citySlug}'`);
    }
  }

  for (const p of parsedProviders) {
    for (const c of p.citiesServed) {
      if (!citySlugs.has(c)) {
        errors.push(`providers.json: Provider '${p.slug}' serves unknown city '${c}'`);
      }
    }
  }

  // Duplicate checks in facts: (citySlug, metric, asOf, sourceUrl)
  const factKeys = new Set<string>();
  for (const fact of parsedFacts) {
    const key = `${fact.citySlug}|${fact.metric}|${fact.asOf}|${fact.sourceUrl}`;
    if (factKeys.has(key)) {
      errors.push(`facts.json: Duplicate fact for (${fact.citySlug}, ${fact.metric}, ${fact.asOf}, ${fact.sourceUrl})`);
    }
    factKeys.add(key);
  }

  // Warnings: asOf older than 24 months, estimate facts
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const twoYearsAgoStr = twoYearsAgo.toISOString().slice(0, 10);

  for (const fact of parsedFacts) {
    const dateStr = fact.asOf.length === 7 ? `${fact.asOf}-01` : fact.asOf;
    if (dateStr < twoYearsAgoStr) {
      warnings.push(`facts.json: Fact for '${fact.citySlug}' (${fact.metric}) asOf '${fact.asOf}' is older than 24 months`);
    }
    if (fact.confidence === "estimate") {
      warnings.push(`facts.json: Fact for '${fact.citySlug}' (${fact.metric}) is marked as 'estimate'`);
    }
  }

  return { errors, warnings };
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const seedDir = path.resolve(process.cwd(), "data/seed");
  console.log(`Validating seed data in ${seedDir}...`);
  const { errors, warnings } = validateData(seedDir);

  if (warnings.length > 0) {
    console.warn(`\nWarnings (${warnings.length}):`);
    for (const w of warnings) {
      console.warn(`  [WARN] ${w}`);
    }
  }

  if (errors.length > 0) {
    console.error(`\nValidation failed with ${errors.length} error(s):`);
    for (const err of errors) {
      console.error(`  [ERROR] ${err}`);
    }
    process.exit(1);
  }

  console.log("Seed data validation passed with 0 errors.");
}
