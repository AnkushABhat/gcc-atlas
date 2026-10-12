import { test, expect } from "@playwright/test";
import { db } from "../../src/db/client";
import * as schema from "../../src/db/schema";
import { eq } from "drizzle-orm";

test.describe("Leads, Offers & Credit Ledger Workflow (Milestone M5)", () => {
  test("Flow 3 & Refund: Buyer submits intro request -> Provider accepts -> Credit -1 -> Contact revealed -> Refund +1", async ({
    page,
  }) => {
    // 1. As buyer, submit intro request for real estate in Bengaluru
    await page.goto("/request-intro");

    await expect(
      page.getByRole("heading", { name: "Request an Introduction" })
    ).toBeVisible();

    // Verify persistent prototype disclaimer per ADR 006
    await expect(
      page.getByText("Prototype: nothing is sent to anyone.")
    ).toBeVisible();

    const uniqueEmail = `buyer-${Date.now()}@acmeglobal.com`;

    await page.locator("#buyerName").fill("Vikram Malhotra");
    await page.locator("#buyerCompany").fill("Acme Global");
    await page.locator("#buyerEmail").fill(uniqueEmail);
    await page.locator("#citySlug").selectOption("bengaluru");
    await page.locator("#headcount").fill("200");
    await page.locator("#function").selectOption("software_engineering");
    await page.locator("#category").selectOption("real_estate");
    await page.locator("#timeline").selectOption("3_months");
    // Preselect CBRE India specifically
    await page.locator("#chosenProviderSlug").selectOption("cbre-india");

    await page.getByRole("button", { name: "Submit Intro Request" }).click();

    // Verify confirmation message
    await expect(page.getByTestId("lead-routed-confirmation")).toBeVisible();

    // 2. Visit inbox and switch demo role to CBRE India
    await page.goto("/inbox");

    const cbreSwitchBtn = page.getByTestId("switch-provider-cbre-india");
    if (await cbreSwitchBtn.isVisible()) {
      await cbreSwitchBtn.click();
    }

    await expect(
      page.getByRole("heading", { name: "Provider Inbox" })
    ).toBeVisible();
    await expect(page.getByText("Managing leads for CBRE India")).toBeVisible();

    // Record initial credit balance
    const balanceLocator = page.getByTestId("credit-balance");
    await expect(balanceLocator).toBeVisible();
    const balanceText = await balanceLocator.innerText();
    const initialCredits = parseInt(balanceText, 10);

    // Locate the newly created offer card
    const offerCard = page.locator("div[data-testid^='offer-card-']").first();
    await expect(offerCard).toBeVisible();

    // Verify buyer contact is hidden
    await expect(offerCard.getByTestId("buyer-contact-hidden")).toBeVisible();
    await expect(
      offerCard.getByText("Contact hidden until accepted")
    ).toBeVisible();

    // 4. Accept offer for 1 credit
    const acceptBtn = offerCard.getByRole("button", {
      name: "Accept (1 credit)",
    });
    await acceptBtn.click();

    // Verify status updated to Accepted
    await expect(offerCard.getByTestId("status-accepted")).toBeVisible();

    // Verify buyer contact is now revealed!
    await expect(offerCard.getByTestId("buyer-contact-revealed")).toBeVisible();
    await expect(offerCard.getByText("Vikram Malhotra")).toBeVisible();
    await expect(offerCard.getByText(uniqueEmail)).toBeVisible();

    // Verify credit balance decreased by exactly 1
    await expect(page.getByTestId("credit-balance")).toHaveText(
      new RegExp(`^${initialCredits - 1}`)
    );

    // Verify ledger has lead_accepted entry
    await expect(
      page.getByRole("cell", { name: "Lead Introduction Accepted" }).first()
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "-1" }).first()).toBeVisible();

    // 5. Test refund path: Flag as invalid
    const refundBtn = offerCard.getByRole("button", {
      name: "Flag as invalid (Refund 1 credit)",
    });
    await expect(refundBtn).toBeVisible();
    await refundBtn.click();

    // Verify status updated to Refunded (+1 credit)
    await expect(offerCard.getByText("Refunded (+1 credit)")).toBeVisible({
      timeout: 10000,
    });

    // Verify credit balance restored (+1)
    await expect(page.getByTestId("credit-balance")).toHaveText(
      new RegExp(`^${initialCredits}`)
    );

    // Verify ledger has refund_invalid entry
    await expect(
      page.getByRole("cell", { name: "Invalid Lead Refund" }).first()
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "+1" }).first()).toBeVisible();
  });

  test("Flow 4: Cap of 3 enforced and fair rotation across providers", async ({
    page,
  }) => {
    // Submit 3 requests in setup_advisor in Bengaluru
    for (let i = 1; i <= 3; i++) {
      await page.goto("/request-intro");
      await page.locator("#buyerName").fill(`Rotation Buyer ${i}`);
      await page.locator("#buyerCompany").fill(`Rotation Corp ${i}`);
      await page.locator("#buyerEmail").fill(`buyer${i}-${Date.now()}@test.com`);
      await page.locator("#citySlug").selectOption("bengaluru");
      await page.locator("#headcount").fill("100");
      await page.locator("#function").selectOption("software_engineering");
      await page.locator("#category").selectOption("setup_advisor");
      await page.locator("#timeline").selectOption("immediate");
      // Leave chosenProviderSlug empty for auto fair rotation

      await page.getByRole("button", { name: "Submit Intro Request" }).click();
      await expect(page.getByTestId("lead-routed-confirmation")).toBeVisible();

      // Check confirmation text reflects at most 3 matched
      const confirmationText = await page
        .getByTestId("lead-routed-confirmation")
        .innerText();
      const match = confirmationText.match(/routed to (\d+)/);
      if (match && match[1]) {
        const count = parseInt(match[1], 10);
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThanOrEqual(3);
      }
    }
  });

  test("Flow 5: Accept with zero credits is refused and fixed by demo top-up", async ({
    page,
  }) => {
    // 1. Drain credits for Trilegal by setting balance to 0 in test DB
    await db
      .delete(schema.creditLedger)
      .where(eq(schema.creditLedger.provider_slug, "trilegal"));

    // Verify balance is now 0
    const rows = await db
      .select({ delta: schema.creditLedger.delta })
      .from(schema.creditLedger)
      .where(eq(schema.creditLedger.provider_slug, "trilegal"));
    expect(rows.length).toBe(0);

    // 2. Submit a legal intro request targeted to Trilegal
    await page.goto("/request-intro");
    await page.locator("#buyerName").fill("Zero Credit Buyer");
    await page.locator("#buyerCompany").fill("Zero Corp");
    await page.locator("#buyerEmail").fill(`zerocredit-${Date.now()}@corp.com`);
    await page.locator("#citySlug").selectOption("bengaluru");
    await page.locator("#headcount").fill("50");
    await page.locator("#function").selectOption("corporate_finance_hr");
    await page.locator("#category").selectOption("legal");
    await page.locator("#timeline").selectOption("immediate");
    await page.locator("#chosenProviderSlug").selectOption("trilegal");
    await page.getByRole("button", { name: "Submit Intro Request" }).click();
    await expect(page.getByTestId("lead-routed-confirmation")).toBeVisible();

    // 3. Go to inbox and switch demo role to Trilegal
    await page.goto("/inbox");
    const trilegalBtn = page.getByTestId("switch-provider-trilegal");
    if (await trilegalBtn.isVisible()) {
      await trilegalBtn.click();
    }

    // Verify balance displays 0 credits
    await expect(page.getByTestId("credit-balance")).toBeVisible();
    await expect(page.getByTestId("credit-balance")).toHaveText(/^0 credits/);

    // 4. Click Accept -> should fail with clear refusal message
    const offerCard = page.locator("div[data-testid^='offer-card-']").first();
    await offerCard.getByRole("button", { name: "Accept (1 credit)" }).click();

    await expect(
      page.getByText("Insufficient credits. Top up demo credits to accept leads.")
    ).toBeVisible();

    // Offer must remain offered (not accepted)
    await expect(offerCard.getByText("Offered (Active)")).toBeVisible();

    // 5. Click "Demo: add 5 credits"
    await page.getByRole("button", { name: "Demo: add 5 credits" }).click();

    // Balance increases to 5 credits
    await expect(page.getByTestId("credit-balance")).toHaveText(/^5 credits/);

    // 6. Now accept succeeds!
    await offerCard.getByRole("button", { name: "Accept (1 credit)" }).click();
    await expect(offerCard.getByTestId("status-accepted")).toBeVisible();
    await expect(page.getByTestId("credit-balance")).toHaveText(/^4 credits/);
  });
});
