import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers
const mockCookiesStore = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const val = mockCookiesStore.get(name);
      return val ? { name, value: val } : undefined;
    },
    set: (name: string, value: string) => {
      mockCookiesStore.set(name, value);
    },
    delete: (name: string) => {
      mockCookiesStore.delete(name);
    },
  })),
}));

import {
  getSession,
  setDemoSession,
  clearDemoSession,
  requireRole,
  UnauthorizedError,
} from "./index";

describe("auth module (ADR 006)", () => {
  beforeEach(() => {
    mockCookiesStore.clear();
  });

  it("defaults to buyer role when no cookie is set", async () => {
    const session = await getSession();
    expect(session).toEqual({ role: "buyer" });
  });

  it("sets and retrieves a signed provider session", async () => {
    await setDemoSession({ role: "provider", providerSlug: "ansr-global" });
    const session = await getSession();
    expect(session).toEqual({
      role: "provider",
      providerSlug: "ansr-global",
    });
  });

  it("sets and retrieves an admin session", async () => {
    await setDemoSession({ role: "admin" });
    const session = await getSession();
    expect(session).toEqual({ role: "admin" });
  });

  it("falls back to buyer when cookie signature is tampered", async () => {
    await setDemoSession({ role: "admin" });
    const rawCookie = mockCookiesStore.get("gcc_atlas_demo_session")!;
    const [payload] = rawCookie.split(".");
    // Tamper with signature
    mockCookiesStore.set("gcc_atlas_demo_session", `${payload}.invalid-sig-here`);

    const session = await getSession();
    expect(session).toEqual({ role: "buyer" });
  });

  it("clears demo session back to buyer", async () => {
    await setDemoSession({ role: "provider", providerSlug: "ansr-global" });
    await clearDemoSession();
    const session = await getSession();
    expect(session).toEqual({ role: "buyer" });
  });

  it("requireRole allows matching role", async () => {
    await setDemoSession({ role: "provider", providerSlug: "ansr-global" });
    const session = await requireRole("provider", { providerSlug: "ansr-global" });
    expect(session.role).toBe("provider");
  });

  it("requireRole throws UnauthorizedError on mismatching role", async () => {
    await expect(requireRole("admin")).rejects.toThrow(UnauthorizedError);
  });

  it("requireRole throws UnauthorizedError on mismatching providerSlug", async () => {
    await setDemoSession({ role: "provider", providerSlug: "ansr-global" });
    await expect(
      requireRole("provider", { providerSlug: "zinnov-advisory" })
    ).rejects.toThrow(UnauthorizedError);
  });
});
