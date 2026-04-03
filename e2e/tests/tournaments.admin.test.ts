import { test, expect } from '@playwright/test';
import { goToLoginPage, loginWith } from './helper';

const ADMIN_EMAIL = 'tibo@mail.com';
const ADMIN_PASSWORD = 'tibo';
const BASE_URL = 'http://localhost:5173';

test.describe('Admin Tournament Page', () => {
  test.beforeEach(async ({ page }) => {
    await goToLoginPage(page);
    await loginWith(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.waitForURL(`${BASE_URL}/`);

    await page.goto(`${BASE_URL}/tournaments`);
    await page.waitForSelector('text=Vinci Easter Cup 2026', { timeout: 15000 });

    await page.getByRole('button', { name: 'Administrer' }).first().click();

    await expect(page.getByText('Gestion du tournoi')).toBeVisible({ timeout: 5000 });
  });

  test('affiche la page de gestion du tournoi', async ({ page }) => {
    await expect(page.getByText('Gestion du tournoi')).toBeVisible();
  });

  test('affiche les informations principales du tournoi', async ({ page }) => {
    await expect(page.getByPlaceholder('Nom du tournoi')).toBeVisible();
    await expect(page.getByPlaceholder('Description')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Confirmer les modifications' })
    ).toBeVisible();
  });

  test('permet de modifier la description', async ({ page }) => {
    const input = page.getByPlaceholder('Description');
    const confirmBtn = page.getByRole('button', { name: 'Confirmer les modifications' });

    await input.fill('Nouvelle description E2E');
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    await expect(page.getByRole('alert')).toBeVisible({ timeout: 8000 });
  });

  test('bloque une valeur invalide pour le nombre de teams', async ({ page }) => {
    await page.locator('input[type="number"]').fill('7');
    await expect(
      page.getByRole('button', { name: 'Confirmer les modifications' })
    ).toBeDisabled();
  });

  test('réactive la confirmation quand la valeur redevient valide', async ({ page }) => {
    const input = page.locator('input[type="number"]');
    const confirmBtn = page.getByRole('button', { name: 'Confirmer les modifications' });

    await input.fill('7');
    await expect(confirmBtn).toBeDisabled();

    await input.fill('8');
    await expect(confirmBtn).toBeEnabled();
  });
});