import { test, expect } from '@playwright/test';
import {
  goToRegisterPage,
  fillRegisterForm,
  generateValidCredentials,
} from './helper';

test.describe('Register', () => {

  // Before each
  test.beforeEach(async ({ page }) => {
    await goToRegisterPage(page);
  });

  // TC1: Register OK
  test('TC1.1: should register a new user with valid credentials and redirect to /login', async ({page,}) => {
    const { email, password, tag } = generateValidCredentials();

    await fillRegisterForm(page, { email, password, tag });
    await page.locator('main').getByRole('button', { name: "S'inscrire" }).click();
    await expect(page).toHaveURL('/login');
  });

  // TC2: Register KO (backend)
  test('TC2.1: should show an error when the email is already in use (HTTP 409)', async ({page,}) => {
    await fillRegisterForm(page, {
      email: 'admin@vinci.be',
      password: 'Valid1@Password',
      tag: 'Admin',
    });
    await page.locator('main').getByRole('button', { name: "S'inscrire" }).click();

    await expect(page.getByRole('alert')).toContainText(
      'Cet email est déjà utilisé par un autre joueur.',
    );
  });

  // TC3: Register KO (frontend)
  test('TC3.1: should show an error when required fields are missing', async ({
    page,
  }) => {
    await page.getByLabel('Adresse email').fill('test@vinci.be');
    await page.locator('main').getByRole('button', { name: "S'inscrire" }).click();

    await expect(page.getByRole('alert')).toContainText(
      'Veuillez remplir tous les champs et choisir un avatar.',
    );
  });

  test('TC3.2: should show an error when the password does not meet the security policy', async ({
    page,
  }) => {
    await page.getByLabel('Adresse email').fill('newuser@vinci.be');
    await page.getByLabel('Mot de passe').fill('weakpassword');
    await page.getByLabel('Tag en jeu').fill('NewUser');
    await page.getByRole('combobox', { name: 'Spécialité' }).click();
    await page.getByRole('option').first().click();
    await page.getByRole('img', { name: 'Avatar 1', exact: true }).click();

    await page.locator('main').getByRole('button', { name: "S'inscrire" }).click();
    await expect(page.getByRole('alert')).toContainText(
      'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
    );
  });
});
