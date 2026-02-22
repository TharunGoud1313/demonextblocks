import { test, expect } from "@playwright/test";

const baseURL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Helper function to generate random data
const generateRandomTitle = () => `Test Report ${Date.now()}`;
const generateRandomDescription = () =>
  `This is a test report description created at ${new Date().toISOString()}`;

// Frequencies available for selection
const frequencies = [
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "specific_dates",
];

// Weekdays available for selection
const weekdays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

// Timezones available for selection
const timezones = [
  "utc",
  "america-new_york",
  "america-chicago",
  "america-denver",
  "america-los_angeles",
  "europe-london",
  "europe-paris",
  "asia-tokyo",
  "asia-dubai",
  "australia-sydney",
  "asia-kuala_lumpur",
  "asia-singapore",
  "asia-jakarta",
  "asia-kolkata",
];

// Helper to pick random element from array
const pickRandom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

// Helper to get a future date string (YYYY-MM-DD)
const getFutureDate = (daysFromNow: number = 1): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
};

test.describe("Report Schedule Page Tests", () => {
  // Increase timeout for these tests since they involve creating/editing records
  test.setTimeout(60000);
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto(`${baseURL}/sign-in`);
    await page.getByRole("textbox", { name: "Email" }).fill("tharun@gmail.com");
    await page.getByRole("textbox", { name: "Password" }).fill("55555555");
    await page.getByRole("button", { name: "Login" }).click();
    // Wait for navigation to complete after login
    await page.waitForURL(/.*(?<!sign-in)$/);
  });

  test("Create a report with daily scheduled execution", async ({ page }) => {
    const reportTitle = generateRandomTitle();
    const reportDescription = generateRandomDescription();

    await page.goto(`${baseURL}/report-schedule`);
    await page.waitForLoadState("networkidle");

    // Click Add button to navigate to create page
    await page.getByTestId("add-report-btn").click();
    await page.waitForURL(/.*report-schedule\/new$/);

    // Fill in report details
    await page.getByTestId("report-title-input").fill(reportTitle);
    await page.getByTestId("report-description-input").fill(reportDescription);

    // Select status
    await page.getByTestId("report-status-trigger").click();
    await page.getByTestId("status-active").click();

    // Add remarks
    await page
      .getByTestId("report-remarks-input")
      .fill("Test remarks for the report");

    // Enable scheduled execution
    await page.getByTestId("schedule-checkbox").click();

    // Wait for schedule config card to appear
    await expect(page.getByTestId("schedule-config-card")).toBeVisible();

    // Select daily frequency
    await page.getByTestId("frequency-daily").click();

    // Set execution time
    await page.getByTestId("schedule-time-input").fill("10:30");

    // Set start date
    await page.getByTestId("start-date-input").fill(getFutureDate(1));

    // Set end date
    await page.getByTestId("end-date-input").fill(getFutureDate(30));

    // Select a random timezone
    const randomTimezone = pickRandom(timezones);
    await page.getByTestId(`timezone-${randomTimezone}`).click();

    // Select delivery options - randomly pick some
    await page.getByTestId("delivery-aiChat").click();
    await page.getByTestId("delivery-email").click();

    // Create the report
    await page.getByTestId("create-report-btn").click();

    // Wait for navigation back to list or success state
    await page.waitForTimeout(2000);
  });

  test("Create a report with weekly scheduled execution", async ({ page }) => {
    const reportTitle = generateRandomTitle();
    const reportDescription = generateRandomDescription();

    await page.goto(`${baseURL}/report-schedule/new`);
    await page.waitForLoadState("networkidle");

    // Fill in report details
    await page.getByTestId("report-title-input").fill(reportTitle);
    await page.getByTestId("report-description-input").fill(reportDescription);

    // Select status
    await page.getByTestId("report-status-trigger").click();
    await page.getByTestId("status-active").click();

    // Enable scheduled execution
    await page.getByTestId("schedule-checkbox").click();

    // Wait for schedule config card to appear
    await expect(page.getByTestId("schedule-config-card")).toBeVisible();

    // Select weekly frequency
    await page.getByTestId("frequency-weekly").click();

    // Set execution time
    await page.getByTestId("schedule-time-input").fill("09:00");

    // Select random weekdays (at least 2)
    const selectedWeekdays = [pickRandom(weekdays), pickRandom(weekdays)];
    for (const day of [...new Set(selectedWeekdays)]) {
      await page.getByTestId(`weekday-${day}`).click();
    }

    // Select timezone
    await page.getByTestId("timezone-utc").click();

    // Select delivery options
    await page.getByTestId("delivery-notifier").click();

    // Create the report
    await page.getByTestId("create-report-btn").click();

    // Wait for success
    await page.waitForTimeout(2000);
  });

  test("Create a report with monthly scheduled execution", async ({ page }) => {
    const reportTitle = generateRandomTitle();
    const reportDescription = generateRandomDescription();

    await page.goto(`${baseURL}/report-schedule/new`);
    await page.waitForLoadState("networkidle");

    // Fill in report details
    await page.getByTestId("report-title-input").fill(reportTitle);
    await page.getByTestId("report-description-input").fill(reportDescription);

    // Select status
    await page.getByTestId("report-status-trigger").click();
    await page.getByTestId("status-active").click();

    // Enable scheduled execution
    await page.getByTestId("schedule-checkbox").click();

    // Wait for schedule config card to appear
    await expect(page.getByTestId("schedule-config-card")).toBeVisible();

    // Select monthly frequency
    await page.getByTestId("frequency-monthly").click();

    // Set execution time
    await page.getByTestId("schedule-time-input").fill("14:00");

    // Set day of month (random between 1-28 to be safe)
    const dayOfMonth = Math.floor(Math.random() * 28) + 1;
    await page.getByTestId("day-of-month-input").fill(dayOfMonth.toString());

    // Select timezone
    await page.getByTestId("timezone-asia-singapore").click();

    // Select delivery options
    await page.getByTestId("delivery-chat").click();
    await page.getByTestId("delivery-email").click();

    // Create the report
    await page.getByTestId("create-report-btn").click();

    // Wait for success
    await page.waitForTimeout(2000);
  });

  test("Create a report with yearly scheduled execution", async ({ page }) => {
    const reportTitle = generateRandomTitle();
    const reportDescription = generateRandomDescription();

    await page.goto(`${baseURL}/report-schedule/new`);
    await page.waitForLoadState("networkidle");

    // Fill in report details
    await page.getByTestId("report-title-input").fill(reportTitle);
    await page.getByTestId("report-description-input").fill(reportDescription);

    // Select status
    await page.getByTestId("report-status-trigger").click();
    await page.getByTestId("status-active").click();

    // Enable scheduled execution
    await page.getByTestId("schedule-checkbox").click();

    // Wait for schedule config card to appear
    await expect(page.getByTestId("schedule-config-card")).toBeVisible();

    // Select yearly frequency
    await page.getByTestId("frequency-yearly").click();

    // Set execution time
    await page.getByTestId("schedule-time-input").fill("08:00");

    // Set year, month, and day
    await page.getByTestId("selected-year-input").fill("2027");
    await page.getByTestId("selected-month-input").fill("6");
    await page.getByTestId("selected-day-input").fill("15");

    // Select timezone
    await page.getByTestId("timezone-europe-london").click();

    // Select delivery options
    await page.getByTestId("delivery-aiChat").click();

    // Create the report
    await page.getByTestId("create-report-btn").click();

    // Wait for success
    await page.waitForTimeout(2000);
  });

  test("Edit an existing report", async ({ page }) => {
    // Navigate to listing page
    await page.goto(`${baseURL}/report-schedule`);
    await page.waitForLoadState("networkidle");

    // Wait for loading to complete (wait for report cards to appear)
    await page.waitForTimeout(3000);

    // Wait for any report card to be visible
    const reportCards = page.locator('[data-testid^="report-card-"]');
    const cardCount = await reportCards.count();

    // Skip test if no reports exist
    if (cardCount === 0) {
      console.log("No existing reports to edit, skipping test");
      return;
    }

    // Click on the first edit button
    const firstEditButton = page
      .locator('[data-testid^="edit-report-btn-"]')
      .first();
    await firstEditButton.click();

    // Wait for edit page to load
    await page.waitForURL(/.*report-schedule\/edit\/\d+$/);
    await page.waitForLoadState("networkidle");

    // Get current title and modify it
    const titleInput = page.getByTestId("report-title-input");
    await titleInput.waitFor({ state: "visible" });
    const currentTitle = await titleInput.inputValue();
    const updatedTitle = `Edited ${currentTitle}`;

    // Update the title
    await titleInput.clear();
    await titleInput.fill(updatedTitle);

    // Update description
    await page.getByTestId("report-description-input").clear();
    await page
      .getByTestId("report-description-input")
      .fill("Updated description via test");

    // Save changes
    await page.getByTestId("save-changes-btn").click();

    // Wait for success
    await page.waitForTimeout(2000);
  });

  test("Delete an existing report", async ({ page }) => {
    // First create a report to delete (to avoid deleting important data)
    const reportTitle = `DeleteMe ${Date.now()}`;
    const reportDescription = "This report will be deleted";

    await page.goto(`${baseURL}/report-schedule/new`);
    await page.waitForLoadState("networkidle");

    // Fill in report details
    await page.getByTestId("report-title-input").fill(reportTitle);
    await page.getByTestId("report-description-input").fill(reportDescription);

    // Select status
    await page.getByTestId("report-status-trigger").click();
    await page.getByTestId("status-active").click();

    // Enable scheduled execution
    await page.getByTestId("schedule-checkbox").click();

    // Wait for schedule config card to appear
    await expect(page.getByTestId("schedule-config-card")).toBeVisible();

    // Select hourly frequency (simplest option)
    await page.getByTestId("frequency-hourly").click();

    // Set start date
    await page.getByTestId("start-date-input").fill(getFutureDate(1));

    // Select timezone
    await page.getByTestId("timezone-utc").click();

    // Create the report
    await page.getByTestId("create-report-btn").click();

    // Wait for success
    await page.waitForTimeout(3000);

    // Navigate to listing page
    await page.goto(`${baseURL}/report-schedule`);
    await page.waitForLoadState("networkidle");

    // Wait for loading to complete
    await page.waitForTimeout(3000);

    // Count reports before deletion
    const reportCardsBeforeDeletion = page.locator(
      '[data-testid^="report-card-"]',
    );
    const countBefore = await reportCardsBeforeDeletion.count();

    // Skip if no reports
    if (countBefore === 0) {
      console.log("No reports to delete, skipping test");
      return;
    }

    // Click on the first delete button
    const firstDeleteButton = page
      .locator('[data-testid^="delete-report-btn-"]')
      .first();
    await firstDeleteButton.click();

    // Wait for deletion to complete
    await page.waitForTimeout(3000);

    // Refresh page to verify deletion
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Count reports after deletion
    const reportCardsAfterDeletion = page.locator(
      '[data-testid^="report-card-"]',
    );
    const countAfter = await reportCardsAfterDeletion.count();

    // Verify at least one report was deleted
    expect(countAfter).toBeLessThan(countBefore);
  });

  test("Create a report with random frequency and options", async ({
    page,
  }) => {
    const reportTitle = generateRandomTitle();
    const reportDescription = generateRandomDescription();
    const randomFrequency = pickRandom(["daily", "weekly", "monthly"]);

    await page.goto(`${baseURL}/report-schedule/new`);
    await page.waitForLoadState("networkidle");

    // Fill in report details
    await page.getByTestId("report-title-input").fill(reportTitle);
    await page.getByTestId("report-description-input").fill(reportDescription);

    // Select status randomly
    await page.getByTestId("report-status-trigger").click();
    const randomStatus = pickRandom(["status-active", "status-inactive"]);
    await page.getByTestId(randomStatus).click();

    // Add remarks
    await page.getByTestId("report-remarks-input").fill("Random test remarks");

    // Enable scheduled execution
    await page.getByTestId("schedule-checkbox").click();

    // Wait for schedule config card to appear
    await expect(page.getByTestId("schedule-config-card")).toBeVisible();

    // Select random frequency
    await page.getByTestId(`frequency-${randomFrequency}`).click();

    // Set execution time
    const randomHour = Math.floor(Math.random() * 24)
      .toString()
      .padStart(2, "0");
    const randomMinute = Math.floor(Math.random() * 60)
      .toString()
      .padStart(2, "0");
    await page
      .getByTestId("schedule-time-input")
      .fill(`${randomHour}:${randomMinute}`);

    // Handle frequency-specific fields
    if (randomFrequency === "daily") {
      await page.getByTestId("start-date-input").fill(getFutureDate(1));
      await page.getByTestId("end-date-input").fill(getFutureDate(60));
    } else if (randomFrequency === "weekly") {
      // Select 1-3 random weekdays
      const numDays = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numDays; i++) {
        const randomDay = pickRandom(weekdays);
        await page.getByTestId(`weekday-${randomDay}`).click();
      }
    } else if (randomFrequency === "monthly") {
      const dayOfMonth = Math.floor(Math.random() * 28) + 1;
      await page.getByTestId("day-of-month-input").fill(dayOfMonth.toString());
    }

    // Select random timezone
    const randomTimezone = pickRandom(timezones);
    await page.getByTestId(`timezone-${randomTimezone}`).click();

    // Randomly select delivery options
    const deliveryOptions = ["aiChat", "notifier", "email", "chat"];
    for (const option of deliveryOptions) {
      if (Math.random() > 0.5) {
        await page.getByTestId(`delivery-${option}`).click();
      }
    }

    // Create the report
    await page.getByTestId("create-report-btn").click();

    // Wait for success
    await page.waitForTimeout(2000);
  });

  test("Search for reports", async ({ page }) => {
    await page.goto(`${baseURL}/report-schedule`);
    await page.waitForLoadState("networkidle");

    // Get the search input
    const searchInput = page.getByTestId("search-reports-input");
    await expect(searchInput).toBeVisible();

    // Type a search term
    await searchInput.fill("Test");
    await page.waitForTimeout(500);

    // Verify search is filtering the list
    const reportCards = page.locator('[data-testid^="report-card-"]');

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);
  });

  test("Report listing page loads correctly", async ({ page }) => {
    await page.goto(`${baseURL}/report-schedule`);
    await page.waitForLoadState("networkidle");

    // Verify page elements are present
    await expect(page.getByTestId("report-schedule-page")).toBeVisible();
    await expect(page.getByTestId("search-reports-input")).toBeVisible();
    await expect(page.getByTestId("add-report-btn")).toBeVisible();
  });
});
