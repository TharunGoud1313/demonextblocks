import { test, expect } from "@playwright/test";

const baseURL = process.env.NEXTAUTH_URL || "http://localhost:3000";

test("Sign Up Successful", async ({ page }) => {
  await page.goto(`${baseURL}/sign-up`);

  await page.getByRole("textbox", { name: "First Name" }).click();
  await page.getByRole("textbox", { name: "First Name" }).fill("John");

  await page.getByRole("textbox", { name: "Last Name" }).click();
  await page.getByRole("textbox", { name: "Last Name" }).fill("Doe");

  await page.getByRole("textbox", { name: "Email" }).click();
  await page
    .getByRole("textbox", { name: "Email" })
    .fill("john.doe@example.com");

  await page.getByRole("textbox", { name: "Username" }).click();
  await page.getByRole("textbox", { name: "Username" }).fill("johndoe123");

  await page.getByRole("textbox", { name: "Mobile" }).click();
  await page.getByRole("textbox", { name: "Mobile" }).fill("+1234567890");

  await page.getByLabel("Password", { exact: true }).click();
  await page.getByLabel("Password", { exact: true }).fill("password123");

  await page.getByLabel("Confirm Password").click();
  await page.getByLabel("Confirm Password").fill("password123");

  await page.getByRole("textbox", { name: "Business Name" }).click();
  await page
    .getByRole("textbox", { name: "Business Name" })
    .fill("Test Business Inc.");

  await page.getByRole("textbox", { name: "Business Number" }).click();
  await page
    .getByRole("textbox", { name: "Business Number" })
    .fill("1234567890");

  await page.getByRole("button", { name: "Create Account" }).click();
});

test("Sign Up Failed, Email already exists", async ({ page }) => {
  await page.goto(`${baseURL}/sign-up`);

  await page.getByRole("textbox", { name: "First Name" }).click();
  await page.getByRole("textbox", { name: "First Name" }).fill("Existing");

  await page.getByRole("textbox", { name: "Last Name" }).click();
  await page.getByRole("textbox", { name: "Last Name" }).fill("User");

  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("tharun@gmail.com");

  await page.getByRole("textbox", { name: "Username" }).click();
  await page.getByRole("textbox", { name: "Username" }).fill("existinguser");

  await page.getByRole("textbox", { name: "Mobile" }).click();
  await page.getByRole("textbox", { name: "Mobile" }).fill("+9876543210");

  await page.getByLabel("Password", { exact: true }).click();
  await page.getByLabel("Password", { exact: true }).fill("password123");

  await page.getByLabel("Confirm Password").click();
  await page.getByLabel("Confirm Password").fill("password123");

  await page.getByRole("textbox", { name: "Business Name" }).click();
  await page
    .getByRole("textbox", { name: "Business Name" })
    .fill("Another Business");

  await page.getByRole("textbox", { name: "Business Number" }).click();
  await page
    .getByRole("textbox", { name: "Business Number" })
    .fill("9876543210");

  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByText("Account already exists")).toBeVisible();
});

test("Sign Up Failed, Passwords don't match", async ({ page }) => {
  await page.goto(`${baseURL}/sign-up`);

  await page.getByRole("textbox", { name: "First Name" }).click();
  await page.getByRole("textbox", { name: "First Name" }).fill("Test");

  await page.getByRole("textbox", { name: "Last Name" }).click();
  await page.getByRole("textbox", { name: "Last Name" }).fill("User");

  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("test@example.com");

  await page.getByRole("textbox", { name: "Username" }).click();
  await page.getByRole("textbox", { name: "Username" }).fill("testuser123");

  await page.getByRole("textbox", { name: "Mobile" }).click();
  await page.getByRole("textbox", { name: "Mobile" }).fill("+1122334455");

  await page.getByLabel("Password", { exact: true }).click();
  await page.getByLabel("Password", { exact: true }).fill("password123");

  await page.getByLabel("Confirm Password").click();
  await page.getByLabel("Confirm Password").fill("differentpassword");

  await page.getByRole("textbox", { name: "Business Name" }).click();
  await page
    .getByRole("textbox", { name: "Business Name" })
    .fill("Test Business");

  await page.getByRole("textbox", { name: "Business Number" }).click();
  await page
    .getByRole("textbox", { name: "Business Number" })
    .fill("1122334455");

  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByText("Passwords don't match")).toBeVisible();
});
