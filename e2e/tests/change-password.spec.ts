import { test, expect } from "@playwright/test";
import {
  goToLoginPage,
  goToProfilePage,
  loginWith,
  registerWith,
  goToRegisterPage,
  changePasswordWith,
  openChangePasswordModal,
  fillChangePasswordForm,
  submitChangePasswordForm,
  generateValidCredentials,
} from "./helper";

const VALID_NEW_PASSWORD = "NouveauPswd26!";

test.describe("Change Password", () => {
  const sharedCredentials = generateValidCredentials();

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await goToRegisterPage(page);
    await registerWith(
      page,
      sharedCredentials.email,
      sharedCredentials.password,
      sharedCredentials.tag,
    );
    await page.waitForURL("http://localhost:5173/login", { timeout: 10000 });
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await goToLoginPage(page);
    await loginWith(page, sharedCredentials.email, sharedCredentials.password);
    await page.waitForURL("http://localhost:5173/", { timeout: 10000 });
    await goToProfilePage(page);
    await expect(
      page.getByRole("button", { name: "Modifier le mot de passe" }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC_CP1: should change password successfully with valid data", async ({
    page,
  }) => {
    const creds = generateValidCredentials();
    const page2 = page;

    await goToRegisterPage(page);
    await registerWith(page, creds.email, creds.password, creds.tag);
    await page.waitForURL("http://localhost:5173/login", { timeout: 10000 });
    await goToLoginPage(page);
    await loginWith(page, creds.email, creds.password);
    await page.waitForURL("http://localhost:5173/", { timeout: 10000 });
    await goToProfilePage(page);
    await expect(
      page.getByRole("button", { name: "Modifier le mot de passe" }),
    ).toBeVisible({ timeout: 10000 });

    await changePasswordWith(page, {
      oldPassword: creds.password,
      newPassword: VALID_NEW_PASSWORD,
      confirmPassword: VALID_NEW_PASSWORD,
    });

    await expect(
      page.getByText("Mot de passe modifié avec succès !"),
    ).toBeVisible();
  });

  test("TC_CP2: modal should close automatically after successful password change", async ({
    page,
  }) => {
    const creds = generateValidCredentials();

    await goToRegisterPage(page);
    await registerWith(page, creds.email, creds.password, creds.tag);
    await page.waitForURL("http://localhost:5173/login", { timeout: 10000 });
    await goToLoginPage(page);
    await loginWith(page, creds.email, creds.password);
    await page.waitForURL("http://localhost:5173/", { timeout: 10000 });
    await goToProfilePage(page);
    await expect(
      page.getByRole("button", { name: "Modifier le mot de passe" }),
    ).toBeVisible({ timeout: 10000 });

    await changePasswordWith(page, {
      oldPassword: creds.password,
      newPassword: VALID_NEW_PASSWORD,
      confirmPassword: VALID_NEW_PASSWORD,
    });

    await expect(page.getByText("Modifier le mot de passe")).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("TC_CP3: should be able to login with new password after change", async ({
    page,
  }) => {
    const creds = generateValidCredentials();

    await goToRegisterPage(page);
    await registerWith(page, creds.email, creds.password, creds.tag);
    await page.waitForURL("http://localhost:5173/login", { timeout: 10000 });
    await goToLoginPage(page);
    await loginWith(page, creds.email, creds.password);
    await page.waitForURL("http://localhost:5173/", { timeout: 10000 });
    await goToProfilePage(page);
    await expect(
      page.getByRole("button", { name: "Modifier le mot de passe" }),
    ).toBeVisible({ timeout: 10000 });

    await changePasswordWith(page, {
      oldPassword: creds.password,
      newPassword: VALID_NEW_PASSWORD,
      confirmPassword: VALID_NEW_PASSWORD,
    });

    await expect(page.getByText("Modifier le mot de passe")).not.toBeVisible({
      timeout: 5000,
    });
    await page.getByText(/se déconnecter/i).click();

    await goToLoginPage(page);
    await loginWith(page, creds.email, VALID_NEW_PASSWORD);

    await expect(page).toHaveURL("http://localhost:5173/", { timeout: 10000 });
  });

  test("TC_CP4: should show error when all fields are empty", async ({
    page,
  }) => {
    await openChangePasswordModal(page);
    await submitChangePasswordForm(page);

    await expect(
      page.getByText("Veuillez compléter tous les champs."),
    ).toBeVisible();
  });

  test("TC_CP5: should show error when new password does not meet regex requirements", async ({
    page,
  }) => {
    await openChangePasswordModal(page);
    await fillChangePasswordForm(page, {
      oldPassword: sharedCredentials.password,
      newPassword: "azerty",
      confirmPassword: "azerty",
    });
    await submitChangePasswordForm(page);

    await expect(
      page.getByText(
        /au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial/i,
      ),
    ).toBeVisible();
  });

  test("TC_CP6: should show error when new passwords do not match", async ({
    page,
  }) => {
    await openChangePasswordModal(page);
    await fillChangePasswordForm(page, {
      oldPassword: sharedCredentials.password,
      newPassword: VALID_NEW_PASSWORD,
      confirmPassword: "MdpDifferent1@",
    });
    await submitChangePasswordForm(page);

    await expect(
      page.getByText("Les nouveaux mots de passe ne correspondent pas."),
    ).toBeVisible();
  });

  test("TC_CP7: should show error when new password is same as old password", async ({
    page,
  }) => {
    await openChangePasswordModal(page);
    await fillChangePasswordForm(page, {
      oldPassword: sharedCredentials.password,
      newPassword: sharedCredentials.password,
      confirmPassword: sharedCredentials.password,
    });
    await submitChangePasswordForm(page);

    await expect(
      page.getByText(
        "Le nouveau mot de passe doit être différent de l'actuel.",
      ),
    ).toBeVisible();
  });

  test("TC_CP8: should show error when old password is incorrect", async ({
    page,
  }) => {
    await changePasswordWith(page, {
      oldPassword: "MauvaisAncienPswd1@",
      newPassword: VALID_NEW_PASSWORD,
      confirmPassword: VALID_NEW_PASSWORD,
    });

    await expect(
      page.getByText("L'ancien mot de passe est incorrect"),
    ).toBeVisible();
  });

  test("TC_CP9: modal should close when clicking Annuler", async ({ page }) => {
    await openChangePasswordModal(page);
    await page.getByRole("button", { name: "Annuler" }).click();

    await expect(page.getByText("Modifier le mot de passe")).not.toBeVisible();
  });

  test("TC_CP10: fields should be reset after closing and reopening the modal", async ({
    page,
  }) => {
    await openChangePasswordModal(page);
    await fillChangePasswordForm(page, {
      oldPassword: sharedCredentials.password,
      newPassword: VALID_NEW_PASSWORD,
      confirmPassword: VALID_NEW_PASSWORD,
    });

    await page.getByRole("button", { name: "Annuler" }).click();
    await page.waitForTimeout(500);
    await openChangePasswordModal(page);

    await expect(page.locator('input[name="oldPassword"]')).toHaveValue("");
    await expect(page.locator('input[name="newPassword"]')).toHaveValue("");
    await expect(page.locator('input[name="confirmPassword"]')).toHaveValue("");
  });
});
