import { test, expect } from "@playwright/test";

test.describe("Visual Guide Onboarding Tour", () => {
  test("Guide trigger button opens dialog, supports next/back navigation, skip, and escape dismissal", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Locate the Guide button in the header
    const guideBtn = page.getByRole("button", { name: "Open visual guide" });
    await expect(guideBtn).toBeVisible();

    // 2. Open the guide
    await guideBtn.click();

    const dialog = page.getByRole("dialog", { name: "Quick Visual Guide" });
    await expect(dialog).toBeVisible();

    // Verify Step 1 content
    await expect(dialog).toContainText("Step 1 of 4");
    await expect(dialog).toContainText("Model Location Priorities & Costs");

    // 3. Advance to Step 2
    const nextBtn = dialog.getByRole("button", { name: "Next step" });
    await nextBtn.click();
    await expect(dialog).toContainText("Step 2 of 4");
    await expect(dialog).toContainText("Explore Vetted Service Providers");

    // 4. Test Back button returns to Step 1
    const backBtn = dialog.getByRole("button", { name: "Back" });
    await backBtn.click();
    await expect(dialog).toContainText("Step 1 of 4");

    // 5. Advance to Step 2 again and test Skip guide
    await nextBtn.click();
    await expect(dialog).toContainText("Step 2 of 4");

    const skipBtn = dialog.getByRole("button", { name: "Skip guide" });
    await expect(skipBtn).toBeVisible();
    await skipBtn.click();

    // Dialog should be dismissed
    await expect(dialog).not.toBeVisible();

    // Verify localStorage has dismissed flag
    const isDismissed = await page.evaluate(() => {
      return localStorage.getItem("gcc_atlas_guide_dismissed");
    });
    expect(isDismissed).toBe("true");

    // 6. Test re-opening on demand via header Guide button
    await guideBtn.click();
    await expect(dialog).toBeVisible();

    // 7. Test closing via Escape key
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });
});
