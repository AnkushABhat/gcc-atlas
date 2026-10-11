import { test, expect } from "@playwright/test";

test.describe("Home page smoke test", () => {
  test("renders prototype disclaimer banner per ADR 006", async ({ page }) => {
    await page.goto("/");
    const banner = page.getByRole("status");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("GCC Atlas Prototype — nothing is sent to anyone");
  });

  test("renders home page title and link to planner", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/GCC Atlas/);
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Data-backed planning for GCC setup in India");

    const plannerLink = page.getByRole("link", { name: "Launch Setup Planner" });
    await expect(plannerLink).toBeVisible();
    await expect(plannerLink).toHaveAttribute("href", "/planner");
  });
});
