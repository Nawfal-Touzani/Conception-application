import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { goToLoginPage, loginWith } from './helper';

test.describe('Login', () => {

  // TC1: OK  
  test('TC1.1: should login with valid credentials and redirect to /', async ({
    page,
  }) => {
    const email = faker.internet.email();
    const password = 'Valid1@Password';
    const tag = faker.internet.username().slice(0, 15);

    await page.request.post('http://localhost:3000/auths/register', {
      data: {
        email,
        password,
        tag,
        imageId: 1,
        specialityId: 1,
      },
    });

    await goToLoginPage(page);
    await loginWith(page, email, password);

    await expect(page).toHaveURL('/');
  });

  test('TC1.2: should login with rememberMe=false', async ({ page }) => {
    const email = faker.internet.email();
    const password = 'Valid1@Password';
    const tag = faker.internet.username().slice(0, 15);

    await page.request.post('http://localhost:3000/auths/register', {
      data: {
        email,
        password,
        tag,
        imageId: 1,
        specialityId: 1,
      },
    });

    await goToLoginPage(page);
    await loginWith(page, email, password, false);

    await expect(page).toHaveURL('/');
  });

  // TC2: KO (backend)
  test('TC2.1: should show backend error on wrong credentials', async ({
    page,
  }) => {
    await goToLoginPage(page);
    await loginWith(page, 'wrong@vinci.be', 'wrongpassword');

    await expect(page.getByRole('alert')).toContainText(
      'Email ou mot de passe incorrect.',
    );
  });

  test('TC2.2: should show banned error on banned account', async ({ page }) => {
    await goToLoginPage(page);
    await loginWith(page, 'banni@vinci.be', 'banni');

    await expect(page.getByRole('alert')).toContainText(
      'Votre compte a été banni.',
    );
  });

    // TC3: KO (frontend)
  test('TC3.1: should show frontend error if fields are empty', async ({
    page,
  }) => {
    await goToLoginPage(page);
    await page.locator('main').getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByRole('alert')).toContainText(
      'Veuillez remplir tous les champs.',
    );
  });

  test('TC3.2: should clear password after failed login attempt', async ({
    page,
  }) => {
    await goToLoginPage(page);
    await page.getByLabel('Adresse email').fill('wrong@vinci.be');
    await page.getByLabel('Mot de passe').fill('wrongpassword');
    await page.locator('main').getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByRole('alert')).toContainText(
      'Email ou mot de passe incorrect.',
    );
    await expect(page.getByLabel('Mot de passe')).toHaveValue('');
  });
});
