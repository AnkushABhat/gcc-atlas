import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth module so we can test claimProvider role checks
let mockCurrentRole = "buyer";
let mockProviderSlug: string | undefined = undefined;

vi.mock("../auth", () => ({
  requireRole: vi.fn(async (role: string, options?: { providerSlug?: string }) => {
    if (mockCurrentRole !== role) {
      throw new Error(`Unauthorized: role ${role} required, got ${mockCurrentRole}`);
    }
    if (role === "provider" && options?.providerSlug && mockProviderSlug !== options.providerSlug) {
      throw new Error(
        `Unauthorized: provider ${options.providerSlug} required, got ${mockProviderSlug}`
      );
    }
    return { role: mockCurrentRole, providerSlug: mockProviderSlug };
  }),
}));

import { listProviders, getProvider, claimProvider } from "./index";

describe("providers module (ADR 005 & M4)", () => {
  beforeEach(() => {
    mockCurrentRole = "buyer";
    mockProviderSlug = undefined;
  });

  it("lists providers in strict alphabetical order by name", async () => {
    const all = await listProviders();
    expect(all.length).toBeGreaterThan(0);

    const names = all.map((p) => p.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it("filters providers by category", async () => {
    const legalProviders = await listProviders({ category: "legal" });
    expect(legalProviders.length).toBeGreaterThan(0);
    for (const p of legalProviders) {
      expect(p.category).toBe("legal");
    }
  });

  it("filters providers by citySlug", async () => {
    // Pune does not have Trilegal according to seed data
    const puneProviders = await listProviders({ citySlug: "pune" });
    expect(puneProviders.length).toBeGreaterThan(0);
    for (const p of puneProviders) {
      expect(p.citiesServed).toContain("pune");
    }
  });

  it("returns an empty list when filters match no providers", async () => {
    const none = await listProviders({
      category: "recruiter",
      citySlug: "coimbatore",
    });
    expect(none).toEqual([]);
  });

  it("fetches single provider by slug", async () => {
    const provider = await getProvider("ansr-global");
    expect(provider).not.toBeNull();
    expect(provider?.name).toBe("ANSR");
    expect(provider?.category).toBe("setup_advisor");
  });

  it("returns null for non-existent provider slug", async () => {
    const provider = await getProvider("non-existent-firm");
    expect(provider).toBeNull();
  });

  it("claimProvider throws error if caller does not have provider role for slug", async () => {
    mockCurrentRole = "buyer";
    await expect(claimProvider("ansr-global")).rejects.toThrow(/Unauthorized/);

    mockCurrentRole = "provider";
    mockProviderSlug = "zinnov-advisory";
    await expect(claimProvider("ansr-global")).rejects.toThrow(/Unauthorized/);
  });

  it("claimProvider succeeds and sets claimedAt when authorized, and is idempotent", async () => {
    mockCurrentRole = "provider";
    mockProviderSlug = "ansr-global";

    const claimed = await claimProvider("ansr-global");
    expect(claimed.claimedAt).not.toBeNull();

    const firstClaimedAt = claimed.claimedAt;

    // Second claim should be idempotent and preserve timestamp
    const claimedAgain = await claimProvider("ansr-global");
    expect(claimedAgain.claimedAt).toBe(firstClaimedAt);
  });
});
