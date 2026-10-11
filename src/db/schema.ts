import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";

/**
 * States table: Indian states and Union Territories
 */
export const states = sqliteTable("states", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
});

/**
 * Cities table: Candidate GCC destinations
 * CRITICAL CONSTRAINT (ADR 003): Cities table MUST NOT have numeric data columns.
 * All figures, metrics, and quantitative facts live strictly in `facts`.
 */
export const cities = sqliteTable("cities", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  state_slug: text("state_slug")
    .notNull()
    .references(() => states.slug),
});

/**
 * Facts table: Sourced numerical metrics and ranges
 * Sourced columns (source_name, source_url, as_of) are NOT NULL per ADR 003.
 */
export const facts = sqliteTable(
  "facts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    city_slug: text("city_slug")
      .notNull()
      .references(() => cities.slug),
    metric: text("metric").notNull(), // 'office_rent_inr_sqft_month' | 'tech_talent_count'
    value_min: real("value_min").notNull(),
    value_max: real("value_max").notNull(),
    unit: text("unit").notNull(),
    source_name: text("source_name").notNull(),
    source_url: text("source_url").notNull(),
    as_of: text("as_of").notNull(), // ISO YYYY-MM-DD or YYYY-MM
    confidence: text("confidence").notNull(), // 'reported' | 'derived' | 'estimate'
    note: text("note"),
  },
  (table) => [
    index("idx_facts_city_metric").on(table.city_slug, table.metric),
  ]
);

/**
 * Incentives table: State-level policy incentives
 */
export const incentives = sqliteTable("incentives", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  state_slug: text("state_slug")
    .notNull()
    .references(() => states.slug),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'capex_subsidy' | 'opex_subsidy' | 'stamp_duty' | 'power' | 'skilling' | 'other'
  summary: text("summary").notNull(),
  min_headcount: integer("min_headcount"),
  max_headcount: integer("max_headcount"),
  functions: text("functions", { mode: "json" }).$type<string[]>(),
  valid_from: text("valid_from"),
  valid_to: text("valid_to"),
  source_name: text("source_name").notNull(),
  source_url: text("source_url").notNull(),
  as_of: text("as_of").notNull(),
});

/**
 * GCCs table: Existing operating or announced GCC centres
 */
export const gccs = sqliteTable(
  "gccs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    parent_company: text("parent_company").notNull(),
    parent_hq_country: text("parent_hq_country").notNull(),
    city_slug: text("city_slug")
      .notNull()
      .references(() => cities.slug),
    functions: text("functions", { mode: "json" }).$type<string[]>().notNull(),
    status: text("status").notNull(), // 'operating' | 'announced'
    announced_on: text("announced_on"),
    source_name: text("source_name").notNull(),
    source_url: text("source_url").notNull(),
    as_of: text("as_of").notNull(),
  },
  (table) => [
    index("idx_gccs_city").on(table.city_slug),
  ]
);

/**
 * Providers table: Setup service providers
 */
export const providers = sqliteTable("providers", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'setup_advisor' | 'real_estate' | 'eor' | 'legal' | 'recruiter'
  cities_served: text("cities_served", { mode: "json" }).$type<string[]>().notNull(),
  website: text("website").notNull(),
  description: text("description").notNull(),
  source_name: text("source_name").notNull(),
  source_url: text("source_url").notNull(),
  as_of: text("as_of").notNull(),
  claimed_at: text("claimed_at"),
});

/**
 * Leads table: Buyer setup inquiries
 */
export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(), // crypto.randomUUID()
  buyer_name: text("buyer_name").notNull(),
  buyer_company: text("buyer_company").notNull(),
  buyer_email: text("buyer_email").notNull(),
  city_slug: text("city_slug")
    .notNull()
    .references(() => cities.slug),
  headcount: integer("headcount").notNull(),
  function: text("function").notNull(),
  category: text("category").notNull(),
  timeline: text("timeline").notNull(),
  note: text("note"),
  created_at: text("created_at").notNull(),
});

/**
 * Lead Offers table: Matched leads routed to providers (max 3 per lead)
 */
export const leadOffers = sqliteTable(
  "lead_offers",
  {
    id: text("id").primaryKey(), // crypto.randomUUID()
    lead_id: text("lead_id")
      .notNull()
      .references(() => leads.id),
    provider_slug: text("provider_slug")
      .notNull()
      .references(() => providers.slug),
    status: text("status").notNull(), // 'offered' | 'accepted' | 'declined' | 'expired' | 'refunded'
    offered_at: text("offered_at").notNull(),
    resolved_at: text("resolved_at"),
  },
  (table) => [
    uniqueIndex("uniq_lead_provider").on(table.lead_id, table.provider_slug),
    index("idx_lead_offers_provider").on(table.provider_slug),
  ]
);

/**
 * Credit Ledger table: Append-only transaction ledger
 * Balance = SUM(delta). Never updated or deleted.
 */
export const creditLedger = sqliteTable(
  "credit_ledger",
  {
    id: text("id").primaryKey(), // crypto.randomUUID()
    provider_slug: text("provider_slug")
      .notNull()
      .references(() => providers.slug),
    delta: integer("delta").notNull(),
    reason: text("reason").notNull(), // 'demo_grant' | 'demo_topup' | 'lead_accepted' | 'refund_invalid'
    lead_offer_id: text("lead_offer_id").references(() => leadOffers.id),
    created_at: text("created_at").notNull(),
  },
  (table) => [
    index("idx_credit_ledger_provider").on(table.provider_slug),
  ]
);
