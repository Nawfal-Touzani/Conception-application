import { test, expect } from "@playwright/test";
import { goToLoginPage, loginWith } from "./helper";

const ADMIN_EMAIL = "admin@vinci.be";
const ADMIN_PASSWORD = "admin";
const BASE_URL = "http://localhost:5173";

test.describe("Admin management - promote admin", () => {
  test.beforeEach(async ({ page }) => {
    await goToLoginPage(page);

    await loginWith(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    await page.waitForURL(`${BASE_URL}/`);

    await page.goto(`${BASE_URL}/admin`);

    await expect(page.getByText("Gestion des administrateurs")).toBeVisible({
      timeout: 5000,
    });
  });

  test("affiche la page admin", async ({ page }) => {
    await expect(page.getByText("Gestion des administrateurs")).toBeVisible();

    await expect(page.getByRole("button", { name: "+" })).toBeVisible();
  });

  test("ouvre la modal d ajout admin", async ({ page }) => {
    await page.getByRole("button", { name: "+" }).click();

    await expect(page.getByText("Ajouter un administrateur")).toBeVisible();
  });

  test("ferme la modal d ajout admin", async ({ page }) => {
    await page.getByRole("button", { name: "+" }).click();

    await expect(page.getByText("Ajouter un administrateur")).toBeVisible();

    await page.getByRole("button", { name: "Fermer" }).click();

    await expect(page.getByText("Ajouter un administrateur")).not.toBeVisible();
  });

  test("ajoute un admin si un membre est disponible", async ({ page }) => {
    await page.getByRole("button", { name: "+" }).click();

    await expect(page.getByText("Ajouter un administrateur")).toBeVisible();

    const addButtons = page.locator("button").filter({
      has: page.locator('svg[data-testid="AddIcon"]'),
    });

    const count = await addButtons.count();

    if (count > 0) {
      await addButtons.first().click();

      await expect(page.getByRole("alert")).toBeVisible({ timeout: 8000 });
    } else {
      await expect(
        page.getByText("Tous les membres sont déjà administrateurs."),
      ).toBeVisible();
    }
  });

  test("permet d accéder à la page tous les membres", async ({ page }) => {
    await page
      .getByRole("button", {
        name: "Tous les membres",
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "Membres",
        exact: true,
      }),
    ).toBeVisible({ timeout: 5000 });
  });
});
