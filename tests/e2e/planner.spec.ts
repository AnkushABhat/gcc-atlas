import { test, expect } from "@playwright/test";

test.describe("Setup Planner E2E Workflow", () => {
  test("loads with default inputs and displays ranked candidate cities", async ({ page }) => {
    await page.goto("/planner");

    // Verify main heading
    const heading = page.getByRole("heading", { name: "GCC Setup Planner" });
    await expect(heading).toBeVisible();

    // Verify prototype disclaimer
    const disclaimer = page.getByText("Prototype Simulation");
    await expect(disclaimer).toBeVisible();

    // Verify ranked candidate cities header
    const rankedHeader = page.getByRole("heading", { name: /Ranked Candidate Cities/i });
    await expect(rankedHeader).toBeVisible();

    // Verify prominent hubs are rendered in ranked list
    await expect(page.getByRole("heading", { name: "Bengaluru" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hyderabad" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pune" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mumbai" })).toBeVisible();
  });

  test("adjusting priority weights dynamically re-ranks candidate cities", async ({ page }) => {
    await page.goto("/planner");

    // Capture initial top city
    const initialTopCard = page.locator("section h3").first();
    await expect(initialTopCard).toBeVisible();

    // Locate the weight sliders
    const talentSlider = page.getByLabel("Talent Availability Weight");
    const costSlider = page.getByLabel("Cost Efficiency Weight");

    // Maximize cost efficiency weight (100) and drop talent weight to 0
    await talentSlider.fill("0");
    await costSlider.fill("100");

    // Verify composite scores update and cheap rent cities rank at top
    // For cost only: Chennai (rent 62-88) and Hyderabad (rent 65-90) beat Mumbai (rent 90-160)
    const newTopCity = page.locator("section h3").first();
    await expect(newTopCity).toBeVisible();
    const newCityName = await newTopCity.innerText();
    expect(["Chennai", "Hyderabad"]).toContain(newCityName);
  });

  test("formats estimated monthly office cost ranges in INR (en-IN lakh/crore)", async ({ page }) => {
    await page.goto("/planner");

    // Cost ranges should contain INR symbol and lakh/crore denomination
    const costLabels = page.getByText(/Estimated Monthly Office Rent/i);
    await expect(costLabels.first()).toBeVisible();

    // Check money format presence (e.g. ₹5.1 lakh or ₹1.2 crore / mo)
    const formattedCost = page.locator("span.font-mono").filter({ hasText: /₹.*(lakh|crore)/ });
    await expect(formattedCost.first()).toBeVisible();
  });

  test("opens sourced value popovers displaying HTTPS source URL and as-of date, closing on Escape", async ({ page }) => {
    await page.goto("/planner");

    // Find and click the first SourcedValue button
    const sourcedButton = page.locator("button[aria-haspopup='dialog']").first();
    await expect(sourcedButton).toBeVisible();
    await sourcedButton.click();

    // Popover dialog should open
    const popover = page.getByRole("dialog", { name: "Data provenance details" });
    await expect(popover).toBeVisible();
    await expect(popover.getByText("Source Attribution")).toBeVisible();

    // Should display HTTPS source URL and as-of date
    const sourceLink = popover.locator("a[href^='https://']");
    await expect(sourceLink).toBeVisible();
    await expect(popover.getByText(/As-of Date:/i)).toBeVisible();

    // Close on Escape key
    await page.keyboard.press("Escape");
    await expect(popover).not.toBeVisible();
  });

  test("displays candidate cities with missing metrics in the Not Ranked section per ADR 004", async ({ page }) => {
    await page.goto("/planner");

    // Not Ranked section should be rendered
    const notRankedHeading = page.getByRole("heading", { name: /Not Ranked/i });
    await expect(notRankedHeading).toBeVisible();

    // Coimbatore is missing tech talent metric
    const coimbatoreCard = page.getByRole("heading", { name: "Coimbatore" });
    await expect(coimbatoreCard).toBeVisible();

    // Explicit missing metric badge
    const missingBadge = page.getByText("Missing: Tech Talent Count");
    await expect(missingBadge).toBeVisible();
  });

  test("filters applicable incentives dynamically when headcount or functional scope changes", async ({ page }) => {
    await page.goto("/planner");

    // Initially at headcount 100 with default functions (engineering, operations),
    // Bengaluru has 2 applicable state incentives
    await expect(page.getByRole("heading", { name: "Bengaluru" })).toBeVisible();
    await expect(page.getByText(/Applicable State Incentives \(2\)/).first()).toBeVisible();

    // Uncheck Engineering & IT and Operations, check Finance & Accounting
    const engineeringCheckbox = page.getByRole("checkbox", { name: "Engineering & IT" });
    const operationsCheckbox = page.getByRole("checkbox", { name: "Operations" });
    const financeCheckbox = page.getByRole("checkbox", { name: "Finance & Accounting" });

    await engineeringCheckbox.uncheck();
    await operationsCheckbox.uncheck();
    await financeCheckbox.check();

    // Bengaluru has no incentives matching finance only (requires engineering / operations)
    await expect(page.getByText("0 state incentives qualify for current criteria").first()).toBeVisible();

    // Re-check Engineering & IT: Bengaluru incentives qualify again
    await engineeringCheckbox.check();
    await expect(page.getByText(/Applicable State Incentives/i).first()).toBeVisible();

    // Verify low headcount filtering: at 10 seats, both Karnataka incentives (min 20 and 100) disqualify
    await page.goto("/planner?headcount=10");
    await expect(page.getByText("0 state incentives qualify for current criteria").first()).toBeVisible();
  });
});
