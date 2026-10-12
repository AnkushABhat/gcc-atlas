import { eq, and, desc } from "drizzle-orm";
import { db } from "../../db/client";
import * as schema from "../../db/schema";
import { requireRole } from "../auth";
import { routeLead, type CandidateProvider } from "./route";
import type {
  CreateLeadInput,
  CreateLeadResult,
  ProviderOffer,
  LedgerEntry,
  OfferStatus,
} from "./types";

export * from "./types";
export * from "./route";

const SEVENTY_TWO_HOURS_MS = 72 * 60 * 60 * 1000;

/**
 * Creates a new buyer lead and routes it to at most 3 matched providers.
 * If 0 providers match, status is 'unmatched'.
 */
export async function createLead(
  input: CreateLeadInput,
  now: Date = new Date()
): Promise<CreateLeadResult> {
  const leadId = crypto.randomUUID();
  const timestamp = now.toISOString();

  // 1. Insert lead record
  await db.insert(schema.leads).values({
    id: leadId,
    buyer_name: input.buyerName,
    buyer_company: input.buyerCompany,
    buyer_email: input.buyerEmail,
    city_slug: input.citySlug,
    headcount: input.headcount,
    function: input.function,
    category: input.category,
    timeline: input.timeline,
    note: input.note ?? null,
    created_at: timestamp,
  });

  // 2. Fetch all providers in this category
  const providerRows = await db
    .select({
      slug: schema.providers.slug,
      category: schema.providers.category,
      citiesServed: schema.providers.cities_served,
    })
    .from(schema.providers)
    .where(eq(schema.providers.category, input.category));

  const candidates: CandidateProvider[] = providerRows.map((p) => ({
    slug: p.slug,
    category: p.category,
    citiesServed: p.citiesServed ?? [],
  }));

  // 3. Collect last_offered_at for candidate providers
  const lastOfferedAtMap: Record<string, string | null> = {};
  for (const candidate of candidates) {
    const recentOffers = await db
      .select({ offeredAt: schema.leadOffers.offered_at })
      .from(schema.leadOffers)
      .where(eq(schema.leadOffers.provider_slug, candidate.slug))
      .orderBy(desc(schema.leadOffers.offered_at))
      .limit(1);

    lastOfferedAtMap[candidate.slug] = recentOffers[0]?.offeredAt ?? null;
  }

  // 4. Run pure routing algorithm
  const matchedSlugs = routeLead({
    category: input.category,
    citySlug: input.citySlug,
    chosenProviderSlugs: input.chosenProviderSlugs,
    candidates,
    lastOfferedAtMap,
  });

  // 5. Create lead_offers for matched providers
  for (const slug of matchedSlugs) {
    await db.insert(schema.leadOffers).values({
      id: crypto.randomUUID(),
      lead_id: leadId,
      provider_slug: slug,
      status: "offered",
      offered_at: timestamp,
      resolved_at: null,
    });
  }

  return {
    leadId,
    offersCreated: matchedSlugs.length,
    offeredProviderSlugs: matchedSlugs,
    status: matchedSlugs.length > 0 ? "matched" : "unmatched",
  };
}

/**
 * Lists all offers for a given provider.
 * Computes expiration and contact visibility at read time.
 */
export async function listOffersForProvider(
  providerSlug: string,
  now: Date = new Date()
): Promise<ProviderOffer[]> {
  const rows = await db
    .select({
      offer: schema.leadOffers,
      lead: schema.leads,
    })
    .from(schema.leadOffers)
    .innerJoin(schema.leads, eq(schema.leadOffers.lead_id, schema.leads.id))
    .where(eq(schema.leadOffers.provider_slug, providerSlug))
    .orderBy(desc(schema.leadOffers.offered_at));

  const currentTime = now.getTime();

  return rows.map(({ offer, lead }) => {
    const offeredTime = new Date(offer.offered_at).getTime();
    const isExpiredTime = currentTime - offeredTime > SEVENTY_TWO_HOURS_MS;

    let computedStatus = offer.status as OfferStatus;
    if (computedStatus === "offered" && isExpiredTime) {
      computedStatus = "expired";
    }

    let canRefund = false;
    if (computedStatus === "accepted" && offer.resolved_at) {
      const resolvedTime = new Date(offer.resolved_at).getTime();
      canRefund = currentTime - resolvedTime <= SEVENTY_TWO_HOURS_MS;
    }

    // Buyer contact is revealed only after lead is accepted or refunded
    const isContactRevealed =
      computedStatus === "accepted" || computedStatus === "refunded";

    return {
      id: offer.id,
      leadId: lead.id,
      providerSlug: offer.provider_slug,
      status: computedStatus,
      offeredAt: offer.offered_at,
      resolvedAt: offer.resolved_at,
      category: lead.category as any,
      citySlug: lead.city_slug,
      headcount: lead.headcount,
      function: lead.function,
      timeline: lead.timeline,
      note: lead.note,
      buyerCompany: lead.buyer_company,
      buyerName: lead.buyer_name,
      buyerEmail: isContactRevealed ? lead.buyer_email : null,
      isExpired: isExpiredTime && offer.status === "offered",
      canRefund,
    };
  });
}

/**
 * Accepts an offer: spends 1 credit, sets accepted, reveals buyer contact.
 */
export async function acceptOffer(
  offerId: string,
  providerSlug: string,
  now: Date = new Date()
): Promise<ProviderOffer> {
  await requireRole("provider", { providerSlug });

  const rows = await db
    .select({
      offer: schema.leadOffers,
      lead: schema.leads,
    })
    .from(schema.leadOffers)
    .innerJoin(schema.leads, eq(schema.leadOffers.lead_id, schema.leads.id))
    .where(
      and(
        eq(schema.leadOffers.id, offerId),
        eq(schema.leadOffers.provider_slug, providerSlug)
      )
    )
    .limit(1);

  const found = rows[0];
  if (!found) {
    throw new Error(`Offer not found: ${offerId}`);
  }

  const { offer, lead } = found;
  const currentTime = now.getTime();
  const offeredTime = new Date(offer.offered_at).getTime();

  if (offer.status === "offered" && currentTime - offeredTime > SEVENTY_TWO_HOURS_MS) {
    throw new Error("Offer has expired.");
  }

  if (offer.status === "accepted") {
    throw new Error("Offer is already accepted.");
  }

  if (offer.status !== "offered") {
    throw new Error(`Offer cannot be accepted in status '${offer.status}'.`);
  }

  // Check balance
  const currentBalance = await balance(providerSlug);
  if (currentBalance < 1) {
    throw new Error(
      "Insufficient credits. You need at least 1 credit to accept a lead."
    );
  }

  const resolvedAt = now.toISOString();

  // Deduct 1 credit in append-only ledger
  await db.insert(schema.creditLedger).values({
    id: crypto.randomUUID(),
    provider_slug: providerSlug,
    delta: -1,
    reason: "lead_accepted",
    lead_offer_id: offerId,
    created_at: resolvedAt,
  });

  // Update offer status
  await db
    .update(schema.leadOffers)
    .set({
      status: "accepted",
      resolved_at: resolvedAt,
    })
    .where(eq(schema.leadOffers.id, offerId));

  return {
    id: offer.id,
    leadId: lead.id,
    providerSlug: offer.provider_slug,
    status: "accepted",
    offeredAt: offer.offered_at,
    resolvedAt,
    category: lead.category as any,
    citySlug: lead.city_slug,
    headcount: lead.headcount,
    function: lead.function,
    timeline: lead.timeline,
    note: lead.note,
    buyerCompany: lead.buyer_company,
    buyerName: lead.buyer_name,
    buyerEmail: lead.buyer_email,
    isExpired: false,
    canRefund: true,
  };
}

/**
 * Declines an offer.
 */
export async function declineOffer(
  offerId: string,
  providerSlug: string,
  now: Date = new Date()
): Promise<ProviderOffer> {
  await requireRole("provider", { providerSlug });

  const rows = await db
    .select({
      offer: schema.leadOffers,
      lead: schema.leads,
    })
    .from(schema.leadOffers)
    .innerJoin(schema.leads, eq(schema.leadOffers.lead_id, schema.leads.id))
    .where(
      and(
        eq(schema.leadOffers.id, offerId),
        eq(schema.leadOffers.provider_slug, providerSlug)
      )
    )
    .limit(1);

  const found = rows[0];
  if (!found) {
    throw new Error(`Offer not found: ${offerId}`);
  }

  const { offer, lead } = found;

  if (offer.status !== "offered") {
    throw new Error(`Offer cannot be declined in status '${offer.status}'.`);
  }

  const resolvedAt = now.toISOString();

  await db
    .update(schema.leadOffers)
    .set({
      status: "declined",
      resolved_at: resolvedAt,
    })
    .where(eq(schema.leadOffers.id, offerId));

  return {
    id: offer.id,
    leadId: lead.id,
    providerSlug: offer.provider_slug,
    status: "declined",
    offeredAt: offer.offered_at,
    resolvedAt,
    category: lead.category as any,
    citySlug: lead.city_slug,
    headcount: lead.headcount,
    function: lead.function,
    timeline: lead.timeline,
    note: lead.note,
    buyerCompany: lead.buyer_company,
    buyerName: lead.buyer_name,
    buyerEmail: null,
    isExpired: false,
    canRefund: false,
  };
}

/**
 * Flags an accepted offer as invalid within 72 hours, issuing 1 credit refund.
 */
export async function flagInvalid(
  offerId: string,
  providerSlug: string,
  now: Date = new Date()
): Promise<ProviderOffer> {
  await requireRole("provider", { providerSlug });

  const rows = await db
    .select({
      offer: schema.leadOffers,
      lead: schema.leads,
    })
    .from(schema.leadOffers)
    .innerJoin(schema.leads, eq(schema.leadOffers.lead_id, schema.leads.id))
    .where(
      and(
        eq(schema.leadOffers.id, offerId),
        eq(schema.leadOffers.provider_slug, providerSlug)
      )
    )
    .limit(1);

  const found = rows[0];
  if (!found) {
    throw new Error(`Offer not found: ${offerId}`);
  }

  const { offer, lead } = found;

  if (offer.status !== "accepted") {
    throw new Error("Only accepted offers can be flagged for refund.");
  }

  if (!offer.resolved_at) {
    throw new Error("Offer lacks resolution timestamp.");
  }

  const currentTime = now.getTime();
  const acceptedTime = new Date(offer.resolved_at).getTime();

  if (currentTime - acceptedTime > SEVENTY_TWO_HOURS_MS) {
    throw new Error(
      "Refund window has closed (must be within 72 hours of acceptance)."
    );
  }

  const refundedAt = now.toISOString();

  // Refund 1 credit
  await db.insert(schema.creditLedger).values({
    id: crypto.randomUUID(),
    provider_slug: providerSlug,
    delta: 1,
    reason: "refund_invalid",
    lead_offer_id: offerId,
    created_at: refundedAt,
  });

  // Update offer to refunded
  await db
    .update(schema.leadOffers)
    .set({
      status: "refunded",
    })
    .where(eq(schema.leadOffers.id, offerId));

  return {
    id: offer.id,
    leadId: lead.id,
    providerSlug: offer.provider_slug,
    status: "refunded",
    offeredAt: offer.offered_at,
    resolvedAt: offer.resolved_at,
    category: lead.category as any,
    citySlug: lead.city_slug,
    headcount: lead.headcount,
    function: lead.function,
    timeline: lead.timeline,
    note: lead.note,
    buyerCompany: lead.buyer_company,
    buyerName: lead.buyer_name,
    buyerEmail: lead.buyer_email,
    isExpired: false,
    canRefund: false,
  };
}

/**
 * Calculates current credit balance: SUM(delta) from credit_ledger.
 */
export async function balance(providerSlug: string): Promise<number> {
  const rows = await db
    .select({ delta: schema.creditLedger.delta })
    .from(schema.creditLedger)
    .where(eq(schema.creditLedger.provider_slug, providerSlug));

  return rows.reduce((sum, r) => sum + r.delta, 0);
}

/**
 * Lists ledger history for a provider ordered by creation date descending.
 */
export async function ledger(providerSlug: string): Promise<LedgerEntry[]> {
  const rows = await db
    .select()
    .from(schema.creditLedger)
    .where(eq(schema.creditLedger.provider_slug, providerSlug))
    .orderBy(desc(schema.creditLedger.created_at));

  return rows.map((r) => ({
    id: r.id,
    providerSlug: r.provider_slug,
    delta: r.delta,
    reason: r.reason as LedgerEntry["reason"],
    leadOfferId: r.lead_offer_id,
    createdAt: r.created_at,
  }));
}

/**
 * Demo top-up: adds 5 credits to provider's ledger.
 */
export async function demoTopUp(
  providerSlug: string,
  now: Date = new Date()
): Promise<number> {
  await requireRole("provider", { providerSlug });

  await db.insert(schema.creditLedger).values({
    id: crypto.randomUUID(),
    provider_slug: providerSlug,
    delta: 5,
    reason: "demo_topup",
    lead_offer_id: null,
    created_at: now.toISOString(),
  });

  return balance(providerSlug);
}
