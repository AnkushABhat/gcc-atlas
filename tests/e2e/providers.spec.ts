import { test, expect } from "@playwright/test";
import { db } from "../../src/db/client";
import * as schema from "../../src/db/schema";
import { eq } from "drizzle-orm";

test.describe("Providers Directory & Claim Flow (Milestone M4)", () => {
  test.beforeEach(async () => {
    // Reset claim status on remote-india so test is idempotent across runs
    await db
      .update(schema.providers)
      .set({ claimed_at: null })
      .where(eq(schema.providers.slug, "remote-india"));
  });

  test("loads provider directory and displays providers in alphabetical order", async ({
    page,
  }) => {
    await page.goto("/providers");

    await expect(
      page.getByRole("heading", { name: "Service Providers", exact: true })
    ).toBeVisible();

    // Verify alphabetical ordering by checking first two provider cards
    const providerLinks = page.locator('a[href^="/providers/"]');
    const count = await providerLinks.count();
    expect(count).toBeGreaterThan(1);

    const first = await providerLinks.nth(0).innerText();
    const second = await providerLinks.nth(1).innerText();
    expect(first.localeCompare(second)).toBeLessThanOrEqual(0);
  });

  test("filters providers by category", async ({ page }) => {
    await page.goto("/providers");

    const categorySelect = page.locator("#category-filter");
    await categorySelect.selectOption("legal");

    await expect(page).toHaveURL(/category=legal/);

    // Both Cyril Amarchand Mangaldas and Trilegal should be visible
    await expect(
      page.getByRole("link", { name: "Cyril Amarchand Mangaldas" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Trilegal" })).toBeVisible();

    // Setup advisor like ANSR should not be visible
    await expect(
      page.getByRole("link", { name: "ANSR", exact: true })
    ).not.toBeVisible();
  });

  test("filters providers by city", async ({ page }) => {
    await page.goto("/providers");

    // Trilegal only serves bengaluru, hyderabad, gurugram, mumbai (NOT pune)
    const citySelect = page.locator("#city-filter");
    await citySelect.selectOption("pune");

    await expect(page).toHaveURL(/city=pune/);

    // Trilegal should not be in the list for Pune
    await expect(
      page.getByRole("link", { name: "Trilegal" })
    ).not.toBeVisible();

    // ANSR serves Pune, so should be visible
    await expect(
      page.getByRole("link", { name: "ANSR", exact: true })
    ).toBeVisible();
  });

  test("shows honest empty state with 'Clear filters' when no providers match", async ({
    page,
  }) => {
    // Navigate with a category and city that yield zero matches
    await page.goto("/providers?category=recruiter&city=coimbatore");

    await expect(
      page.getByText("No providers match these filters. Clear filters.")
    ).toBeVisible();

    // Click Clear filters link
    await page.getByRole("link", { name: "Clear filters" }).first().click();

    await expect(page).toHaveURL("/providers");
    await expect(
      page.getByRole("link", { name: "ANSR", exact: true })
    ).toBeVisible();
  });

  test("navigates to provider profile and displays accurate metadata", async ({
    page,
  }) => {
    await page.goto("/providers/ansr-global");

    await expect(
      page.getByRole("heading", { name: "ANSR", exact: true })
    ).toBeVisible();
    await expect(page.getByText("Setup Advisor")).toBeVisible();
    await expect(page.getByText("https://ansr.com")).toBeVisible();
    await expect(page.getByText("ANSR Corporate Overview")).toBeVisible();

    // Ensure banned marketing adjectives are NOT present per AGENTS.md
    const content = await page.content();
    expect(content.toLowerCase()).not.toContain("verified provider");
    expect(content.toLowerCase()).not.toContain("trusted provider");
    expect(content.toLowerCase()).not.toContain("top provider");
  });

  test("claim flow: claiming a profile displays Claimed badge and Owner badge", async ({
    page,
  }) => {
    await page.goto("/providers/remote-india");

    await expect(
      page.getByRole("heading", { name: "Remote", exact: true })
    ).toBeVisible();

    // Click the claim button (which sets demo role and claims)
    const claimButton = page.getByRole("button", { name: /Claim profile/i });
    await expect(claimButton).toBeVisible();
    await claimButton.click();

    // Now Claimed badge must be visible
    await expect(page.getByTestId("claimed-badge")).toBeVisible();
    await expect(page.getByTestId("claimed-badge")).toHaveText("Claimed");

    // Owner badge must also be visible because this demo session claimed it
    await expect(page.getByTestId("owner-badge")).toBeVisible();
    await expect(page.getByTestId("owner-badge")).toHaveText("Owner");
  });
});
