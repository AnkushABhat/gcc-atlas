import { test, expect } from "@playwright/test";

test.describe("M6 Accessibility, Keyboard Navigation & Console Hygiene", () => {
  test("Planner has no console errors and is fully keyboard-navigable", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/planner");

    // Verify zero console errors
    expect(consoleErrors).toEqual([]);

    // Verify all interactive inputs have accessible labels
    const headcountInput = page.getByLabel("Target Headcount");
    await expect(headcountInput).toBeVisible();

    const sqftInput = page.getByLabel(/Space per Seat/i);
    await expect(sqftInput).toBeVisible();

    const talentSlider = page.getByLabel("Talent Availability Weight");
    await expect(talentSlider).toBeVisible();

    // Test keyboard focus and arrow key adjustments on slider
    await talentSlider.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");

    // Test SourcedValue popover via keyboard
    const sourcedButton = page.locator("button[aria-haspopup='dialog']").first();
    await sourcedButton.focus();
    await page.keyboard.press("Enter");

    const popover = page.getByRole("dialog", {
      name: "Data provenance details",
    });
    await expect(popover).toBeVisible();

    // Close on Escape key
    await page.keyboard.press("Escape");
    await expect(popover).not.toBeVisible();
  });

  test("Inbox has no console errors and DataTable supports keyboard sorting", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Switch to CBRE India to view inbox with ledger
    await page.goto("/inbox");
    const cbreBtn = page.getByTestId("switch-provider-cbre-india");
    if (await cbreBtn.isVisible()) {
      await cbreBtn.click();
    }

    await expect(
      page.getByRole("heading", { name: "Provider Inbox" })
    ).toBeVisible();

    // Verify zero console errors
    expect(consoleErrors).toEqual([]);

    // Find DataTable in Credit ledger
    const ledgerTable = page.getByRole("region", {
      name: "Credit ledger transactions",
    });
    await expect(ledgerTable).toBeVisible();

    // Locate sortable "Date" column header button
    const dateHeaderBtn = ledgerTable.getByRole("button", {
      name: "Sort by Date",
    });
    await expect(dateHeaderBtn).toBeVisible();

    // Verify initial sort state
    const dateTh = ledgerTable.locator("th[aria-sort]").first();
    await expect(dateTh).toHaveAttribute("aria-sort", "descending");

    // Toggle sort via keyboard Enter
    await dateHeaderBtn.focus();
    await page.keyboard.press("Enter");
    await expect(dateTh).toHaveAttribute("aria-sort", "ascending");
  });

  test("All pages maintain valid semantic HTML structure with accessible labels", async ({
    page,
  }) => {
    const routes = ["/", "/planner", "/providers", "/request-intro", "/inbox"];

    for (const route of routes) {
      await page.goto(route);

      // Verify page has a main heading
      const h1 = page.locator("h1");
      await expect(h1.first()).toBeVisible();

      // Verify persistent disclaimer banner is accessible
      const banner = page.getByRole("status");
      await expect(banner).toBeVisible();
    }
  });
});
