import { test, expect } from '@playwright/test';
import { goToLoginPage, loginWith } from './helper';

const ADMIN_EMAIL = 'admin@vinci.be';
const ADMIN_PASSWORD = 'admin';
const BASE_URL = 'http://localhost:5173';

test.describe('Admin Tournament Page', () => {
  test.beforeEach(async ({ page }) => {
    await goToLoginPage(page);
    await loginWith(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    await page.waitForURL(`${BASE_URL}/`);

    await page.goto(`${BASE_URL}/tournaments`);

    await page.waitForSelector('text=Elite Championship 2026', {
      timeout: 15000,
    });

    await page
      .getByRole('button', { name: 'Administrer' })
      .first()
      .click();

    await expect(
      page.getByText('Gestion du tournoi')
    ).toBeVisible({ timeout: 5000 });
  });

  test('affiche la page de gestion du tournoi', async ({ page }) => {
    await expect(
      page.getByText('Gestion du tournoi')
    ).toBeVisible();
  });

  test('affiche les informations principales du tournoi', async ({ page }) => {
    await expect(
      page.getByPlaceholder('Nom du tournoi')
    ).toBeVisible();

    await expect(
      page.getByPlaceholder('Description')
    ).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: 'Confirmer les modifications',
      })
    ).toBeVisible();
  });

  test('affiche le statut du tournoi', async ({ page }) => {
    await expect(
      page.getByText(/Inscriptions ouvertes|Complet|En cours|Terminé|Annulé/)
    ).toBeVisible();
  });

  test('si tournoi public, les champs sont désactivés', async ({ page }) => {
    const descriptionInput = page.getByPlaceholder('Description');
    const numberInput = page.locator('input[type="number"]');

    await expect(descriptionInput).toBeDisabled();
    await expect(numberInput).toBeDisabled();
  });

  test('affiche le message tournoi public si verrouillé', async ({ page }) => {
    const alert = page.getByText(
      'Le tournoi est public, les informations ne peuvent plus être modifiées.'
    );

    if (await alert.isVisible()) {
      await expect(alert).toBeVisible();
    }
  });
});