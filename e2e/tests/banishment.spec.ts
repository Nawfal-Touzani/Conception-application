import { test, expect } from "@playwright/test";
import {
  goToLoginPage,
  goToAdminMembersPage,
  loginWith,
  loginAsAdmin,
  registerWith,
  goToRegisterPage,
  banMember,
  generateValidCredentials,
} from "./helper";

const BAN_REASON = "Triches";

test.describe("Ban Member", () => {

  test("BAN1: should move member from active list to banned list after ban", async ({
    page,
  }) => {
    const creds = generateValidCredentials();
    await goToRegisterPage(page);
    await registerWith(page, creds.email, creds.password, creds.tag);
    await page.waitForURL("http://localhost:5173/login", { timeout: 10000 });

    await loginAsAdmin(page);
    await goToAdminMembersPage(page);

    await expect(page.getByText(creds.tag).first()).toBeVisible({
      timeout: 10000,
    });

    await banMember(page, creds.tag, BAN_REASON);

    const bannedSection = page.getByText("Membres Bannis").locator("../..");
    await expect(bannedSection.getByText(creds.tag)).toBeVisible({
      timeout: 10000,
    });
  });

  test("BAN2: banned member should not be able to login", async ({
    page,
  }) => {
    const creds = generateValidCredentials();

    await goToRegisterPage(page);
    await registerWith(page, creds.email, creds.password, creds.tag);
    await page.waitForURL("http://localhost:5173/login", { timeout: 10000 });

    await loginAsAdmin(page);
    await goToAdminMembersPage(page);
    await expect(page.getByText(creds.tag).first()).toBeVisible({
      timeout: 10000,
    });
    await banMember(page, creds.tag, BAN_REASON);

    await page.goto("http://localhost:5173/login");
    await loginWith(page, creds.email, creds.password);

    await expect(page.getByText("Votre compte a été banni.")).toBeVisible({
      timeout: 10000,
    });
  });

  test("BAN3: ban info modal should display correct reason and member tag", async ({
    page,
  }) => {
    const creds = generateValidCredentials();

    await goToRegisterPage(page);
    await registerWith(page, creds.email, creds.password, creds.tag);
    await page.waitForURL("http://localhost:5173/login", { timeout: 10000 });

    await loginAsAdmin(page);
    await goToAdminMembersPage(page);
    await expect(page.getByText(creds.tag).first()).toBeVisible({
      timeout: 10000,
    });
    await banMember(page, creds.tag, BAN_REASON);

    await page
      .getByTestId(`member-row-${creds.tag}`)
      .getByRole("button", { name: "Détails du bannissement" })
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(creds.tag)).toBeVisible();
    await expect(dialog.getByText(BAN_REASON)).toBeVisible();
  });


  test("BAN4: should show error when ban reason is empty", async ({
    page,
  }) => {
    const creds = generateValidCredentials();

    await goToRegisterPage(page);
    await registerWith(page, creds.email, creds.password, creds.tag);
    await page.waitForURL("http://localhost:5173/login", { timeout: 10000 });

    await loginAsAdmin(page);
    await goToAdminMembersPage(page);
    await expect(page.getByText(creds.tag).first()).toBeVisible({
      timeout: 10000,
    });

    await page
      .getByTestId(`member-row-${creds.tag}`)
      .getByRole("button", { name: "Bannir le membre" })
      .click();

    await page.getByRole("button", { name: "Confirmer" }).click();

    await expect(
      page.getByText("Veuillez indiquer une raison pour le bannissement."),
    ).toBeVisible();
  });

  test("BAN5: should show error when ban reason is only whitespace", async ({
    page,
  }) => {
    const creds = generateValidCredentials();

    await goToRegisterPage(page);
    await registerWith(page, creds.email, creds.password, creds.tag);
    await page.waitForURL("http://localhost:5173/login", { timeout: 10000 });

    await loginAsAdmin(page);
    await goToAdminMembersPage(page);
    await expect(page.getByText(creds.tag).first()).toBeVisible({
      timeout: 10000,
    });

    await page
      .getByTestId(`member-row-${creds.tag}`)
      .getByRole("button", { name: "Bannir le membre" })
      .click();

    await page.getByLabel("Raison du bannissement").fill("     ");
    await page.getByRole("button", { name: "Confirmer" }).click();

    await expect(
      page.getByText("Veuillez indiquer une raison pour le bannissement."),
    ).toBeVisible();
  });


  test("BAN6: modal should close when clicking Annuler", async ({
    page,
  }) => {
    const creds = generateValidCredentials();

    await goToRegisterPage(page);
    await registerWith(page, creds.email, creds.password, creds.tag);
    await page.waitForURL("http://localhost:5173/login", { timeout: 10000 });

    await loginAsAdmin(page);
    await goToAdminMembersPage(page);
    await expect(page.getByText(creds.tag).first()).toBeVisible({
      timeout: 10000,
    });

    await page
      .getByTestId(`member-row-${creds.tag}`)
      .getByRole("button", { name: "Bannir le membre" })
      .click();

    await expect(page.getByText("Bannir le membre")).toBeVisible();
    await page.getByRole("button", { name: "Annuler" }).click();
    await expect(page.getByText("Bannir le membre")).not.toBeVisible();

    await expect(page.getByText(creds.tag).first()).toBeVisible();
  });

  test("BAN7: reason field should be reset after closing and reopening ban modal", async ({
    page,
  }) => {
    const creds = generateValidCredentials();

    await goToRegisterPage(page);
    await registerWith(page, creds.email, creds.password, creds.tag);
    await page.waitForURL("http://localhost:5173/login", { timeout: 10000 });

    await loginAsAdmin(page);
    await goToAdminMembersPage(page);
    await expect(page.getByText(creds.tag).first()).toBeVisible({
      timeout: 10000,
    });

    await page
      .getByTestId(`member-row-${creds.tag}`)
      .getByRole("button", { name: "Bannir le membre" })
      .click();

    await page.getByLabel("Raison du bannissement").fill(BAN_REASON);
    await page.getByRole("button", { name: "Annuler" }).click();

    await page.waitForTimeout(500);

    await page
      .getByTestId(`member-row-${creds.tag}`)
      .getByRole("button", { name: "Bannir le membre" })
      .click();

    await expect(page.getByLabel("Raison du bannissement")).toHaveValue("");
  });


  test("BAN8: non-admin member should not see any members on admin page", async ({
    page,
  }) => {
    const creds = generateValidCredentials();

    await goToRegisterPage(page);
    await registerWith(page, creds.email, creds.password, creds.tag);
    await page.waitForURL("http://localhost:5173/login", { timeout: 10000 });

    await page.goto("http://localhost:5173/login");
    await loginWith(page, creds.email, creds.password);
    await page.waitForURL("http://localhost:5173/", { timeout: 10000 });

    await goToAdminMembersPage(page);
  });
});
