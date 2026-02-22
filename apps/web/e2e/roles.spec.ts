import { test, expect } from "@playwright/test";

const baseURL = process.env.NEXTAUTH_URL || "http://localhost:3000";

test.describe("Roles Page Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto(`${baseURL}/sign-in`);
    await page.getByRole("textbox", { name: "Email" }).fill("tharun@gmail.com");
    await page.getByRole("textbox", { name: "Password" }).fill("55555555");
    await page.getByRole("button", { name: "Login" }).click();
    // Wait for navigation to complete after login
    await page.waitForURL(/.*(?<!sign-in)$/);
  });

  test("Create a role in roles tab", async ({ page }) => {
    await page.goto(`${baseURL}/roles`);

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Click Add button to open create dialog
    await page.getByTestId("add-role-btn").click();

    // Wait for dialog to appear
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Create Role" }),
    ).toBeVisible();

    // Fill in role details
    await page.getByLabel("Title").fill("Test Role");
    await page
      .getByLabel("Description")
      .fill("This is a test role description");
    await page.getByLabel("App Name").fill("TestApp");

    // Select status
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "active", exact: true }).click();

    // Save the role
    await page.getByRole("button", { name: "Save" }).click();

    // Verify success message
    await expect(page.getByText("Record created")).toBeVisible();
  });

  test("Create a new page in pages tab", async ({ page }) => {
    await page.goto(`${baseURL}/roles/pages`);

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Click Add button to open create dialog
    await page.getByTestId("add-page-btn").click();

    // Wait for dialog to appear
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Create Page" }),
    ).toBeVisible();

    // Fill in page details
    await page.getByLabel("Page Name").fill("Test Page");
    await page.getByLabel("Page Link").fill("/test-page");
    await page.getByLabel("App Name").fill("TestApp");

    // Select status
    await page.getByRole("combobox", { name: "Status" }).click();
    await page.getByRole("option", { name: "active", exact: true }).click();

    // Save the page
    await page.getByRole("button", { name: "Save" }).click();

    // Verify success message
    await expect(page.getByText("Record created")).toBeVisible();
  });

  test("Create a new contact in contacts tab", async ({ page }) => {
    await page.goto(`${baseURL}/roles/contacts`);

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Click Add button to open create dialog
    await page.getByTestId("add-contact-btn").click();

    // Wait for dialog to appear
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Create Contact" }),
    ).toBeVisible();

    // Fill in contact details
    await page.getByLabel("First Name").fill("Test");
    await page.getByLabel("Last Name").fill("User");
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Email").fill(`testuser${Date.now()}@example.com`);
    await page.getByLabel("Phone Number").fill("+1234567890");
    await page.getByLabel("Password").fill("password123");

    // Select status
    await page.getByRole("combobox", { name: "Status" }).click();
    await page.getByRole("option", { name: "active", exact: true }).click();

    // Save the contact
    await page.getByRole("button", { name: "Save" }).click();

    // Verify success message
    
  });
});
