import { describe, it, expect, vi, beforeEach } from "vitest";
import { routeLead, type CandidateProvider } from "./route";

let mockCurrentRole = "provider";
let mockProviderSlug = "ansr-global";

vi.mock("../auth", () => ({
  requireRole: vi.fn(async (role: string, options?: { providerSlug?: string }) => {
    if (mockCurrentRole !== role) {
      throw new Error(`Unauthorized role: ${role}`);
    }
    if (role === "provider" && options?.providerSlug && mockProviderSlug !== options.providerSlug) {
      throw new Error(`Unauthorized provider: ${options.providerSlug}`);
    }
    return { role: mockCurrentRole, providerSlug: mockProviderSlug };
  }),
}));

import {
  createLead,
  listOffersForProvider,
  acceptOffer,
  declineOffer,
  flagInvalid,
  balance,
  ledger,
  demoTopUp,
} from "./index";

describe("leads module - pure routing (ADR 005)", () => {
  const candidates: CandidateProvider[] = [
    { slug: "firm-a", category: "setup_advisor", citiesServed: ["bengaluru", "hyderabad"] },
    { slug: "firm-b", category: "setup_advisor", citiesServed: ["bengaluru"] },
    { slug: "firm-c", category: "setup_advisor", citiesServed: ["bengaluru", "pune"] },
    { slug: "firm-d", category: "setup_advisor", citiesServed: ["bengaluru", "mumbai"] },
    { slug: "firm-e", category: "real_estate", citiesServed: ["bengaluru"] }, // different category
  ];

  it("enforces cap of 3 providers", () => {
    const lastOffered: Record<string, string | null> = {
      "firm-a": null,
      "firm-b": null,
      "firm-c": null,
      "firm-d": null,
    };

    const routed = routeLead({
      category: "setup_advisor",
      citySlug: "bengaluru",
      candidates,
      lastOfferedAtMap: lastOffered,
    });

    expect(routed.length).toBe(3);
    expect(routed).toEqual(["firm-a", "firm-b", "firm-c"]);
  });

  it("rotates fairly based on last_offered_at ascending", () => {
    // firm-a and firm-b were offered recently; firm-c and firm-d were offered earlier
    const lastOffered: Record<string, string | null> = {
      "firm-a": "2025-01-10T12:00:00Z",
      "firm-b": "2025-01-09T12:00:00Z",
      "firm-c": "2025-01-01T12:00:00Z", // oldest
      "firm-d": null, // never offered -> prioritized!
    };

    const routed = routeLead({
      category: "setup_advisor",
      citySlug: "bengaluru",
      candidates,
      lastOfferedAtMap: lastOffered,
    });

    // 1. firm-d (never offered)
    // 2. firm-c (oldest offered)
    // 3. firm-b (second oldest)
    expect(routed).toEqual(["firm-d", "firm-c", "firm-b"]);
  });

  it("respects buyer chosen providers (max 3)", () => {
    const lastOffered: Record<string, string | null> = {
      "firm-a": null,
      "firm-b": null,
      "firm-c": null,
      "firm-d": null,
    };

    const routed = routeLead({
      category: "setup_advisor",
      citySlug: "bengaluru",
      chosenProviderSlugs: ["firm-d", "firm-b"],
      candidates,
      lastOfferedAtMap: lastOffered,
    });

    expect(routed).toEqual(["firm-b", "firm-d"]);
  });

  it("returns empty array when unmatched (0 eligible)", () => {
    const routed = routeLead({
      category: "setup_advisor",
      citySlug: "kolkata", // none serve kolkata
      candidates,
      lastOfferedAtMap: {},
    });

    expect(routed).toEqual([]);
  });
});

describe("leads module - lifecycle and ledger (ADR 005 & ADR 006)", () => {
  beforeEach(() => {
    mockCurrentRole = "provider";
    mockProviderSlug = "ansr-global";
  });

  it("creates lead and routes offers, hiding contact before acceptance", async () => {
    const result = await createLead({
      buyerName: "Rahul Sharma",
      buyerCompany: "Acme FinTech",
      buyerEmail: "rahul@acmefintech.com",
      citySlug: "bengaluru",
      headcount: 150,
      function: "software_engineering",
      category: "setup_advisor",
      timeline: "3_months",
      note: "Exploring GCC establishment.",
    });

    expect(result.status).toBe("matched");
    expect(result.offersCreated).toBeGreaterThan(0);
    expect(result.offersCreated).toBeLessThanOrEqual(3);

    // If ansr-global was matched, check offers list
    const ansrOffers = await listOffersForProvider("ansr-global");
    const myOffer = ansrOffers.find((o) => o.leadId === result.leadId);

    if (myOffer) {
      expect(myOffer.status).toBe("offered");
      // Buyer contact is hidden!
      expect(myOffer.buyerEmail).toBeNull();
      expect(myOffer.buyerCompany).toBe("Acme FinTech");
    }
  });

  it("accepts offer: spends 1 credit, reveals contact, ledger sum equals balance", async () => {
    mockProviderSlug = "ansr-global";

    // Create a targeted lead
    const result = await createLead({
      buyerName: "Priya Nair",
      buyerCompany: "Priya Global",
      buyerEmail: "priya@priyaglobal.com",
      citySlug: "bengaluru",
      headcount: 50,
      function: "software_engineering",
      category: "setup_advisor",
      timeline: "immediate",
      chosenProviderSlugs: ["ansr-global"],
    });

    const initialBalance = await balance("ansr-global");
    expect(initialBalance).toBeGreaterThanOrEqual(1);

    const offers = await listOffersForProvider("ansr-global");
    const targetOffer = offers.find((o) => o.leadId === result.leadId);
    expect(targetOffer).toBeDefined();

    // Accept offer
    const accepted = await acceptOffer(targetOffer!.id, "ansr-global");
    expect(accepted.status).toBe("accepted");
    expect(accepted.buyerEmail).toBe("priya@priyaglobal.com"); // revealed!

    // Balance decreased by 1
    const newBalance = await balance("ansr-global");
    expect(newBalance).toBe(initialBalance - 1);

    // Ledger sum equals balance
    const ledgerEntries = await ledger("ansr-global");
    const sum = ledgerEntries.reduce((acc, e) => acc + e.delta, 0);
    expect(sum).toBe(newBalance);

    // Double accept fails
    await expect(acceptOffer(targetOffer!.id, "ansr-global")).rejects.toThrow(
      /already accepted/
    );
  });

  it("rejects accept if offer is expired (>72 hours)", async () => {
    mockProviderSlug = "ansr-global";

    const oldDate = new Date("2024-01-01T00:00:00Z");
    const result = await createLead(
      {
        buyerName: "Old Lead",
        buyerCompany: "Old Corp",
        buyerEmail: "old@corp.com",
        citySlug: "bengaluru",
        headcount: 20,
        function: "it_operations",
        category: "setup_advisor",
        timeline: "exploring",
        chosenProviderSlugs: ["ansr-global"],
      },
      oldDate
    );

    const offers = await listOffersForProvider("ansr-global", new Date("2024-01-10T00:00:00Z"));
    const oldOffer = offers.find((o) => o.leadId === result.leadId);
    expect(oldOffer?.status).toBe("expired");

    // Attempting to accept at present time fails with expired
    await expect(
      acceptOffer(oldOffer!.id, "ansr-global", new Date())
    ).rejects.toThrow(/expired/);
  });

  it("flags invalid lead within 72h: refunds 1 credit and fails on second attempt", async () => {
    mockProviderSlug = "ansr-global";

    const createTime = new Date("2025-06-01T10:00:00Z");
    const result = await createLead(
      {
        buyerName: "Spam Bot",
        buyerCompany: "Spam Ltd",
        buyerEmail: "spam@fake.org",
        citySlug: "bengaluru",
        headcount: 10,
        function: "sales",
        category: "setup_advisor",
        timeline: "immediate",
        chosenProviderSlugs: ["ansr-global"],
      },
      createTime
    );

    const acceptTime = new Date("2025-06-01T12:00:00Z");
    const accepted = await acceptOffer(
      (await listOffersForProvider("ansr-global", acceptTime)).find(
        (o) => o.leadId === result.leadId
      )!.id,
      "ansr-global",
      acceptTime
    );

    const balanceBeforeRefund = await balance("ansr-global");

    // Flag as invalid within 24 hours of acceptance
    const flagTime = new Date("2025-06-02T12:00:00Z");
    const refunded = await flagInvalid(accepted.id, "ansr-global", flagTime);
    expect(refunded.status).toBe("refunded");

    const balanceAfterRefund = await balance("ansr-global");
    expect(balanceAfterRefund).toBe(balanceBeforeRefund + 1);

    // Second refund attempt fails
    await expect(flagInvalid(accepted.id, "ansr-global", flagTime)).rejects.toThrow(
      /Only accepted offers/
    );
  });

  it("declines an offer and updates status to declined", async () => {
    mockProviderSlug = "ansr-global";

    const result = await createLead({
      buyerName: "Decline Test",
      buyerCompany: "Decline Corp",
      buyerEmail: "decline@corp.com",
      citySlug: "bengaluru",
      headcount: 25,
      function: "legal",
      category: "setup_advisor",
      timeline: "immediate",
      chosenProviderSlugs: ["ansr-global"],
    });

    const offers = await listOffersForProvider("ansr-global");
    const target = offers.find((o) => o.leadId === result.leadId);
    expect(target).toBeDefined();

    const declined = await declineOffer(target!.id, "ansr-global");
    expect(declined.status).toBe("declined");

    // Declining twice or accepting a declined offer fails
    await expect(declineOffer(target!.id, "ansr-global")).rejects.toThrow(/declined/);
    await expect(acceptOffer(target!.id, "ansr-global")).rejects.toThrow(/cannot be accepted/);
  });

  it("demo top up adds 5 credits to ledger", async () => {
    mockProviderSlug = "ansr-global";
    const initial = await balance("ansr-global");
    const newBal = await demoTopUp("ansr-global");
    expect(newBal).toBe(initial + 5);
  });
});
