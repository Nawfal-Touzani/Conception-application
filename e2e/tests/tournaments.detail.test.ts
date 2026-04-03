import { test, expect } from '@playwright/test';

test.describe('Tournament Detail Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByLabel('Adresse email').fill('lea@mail.com');
    await page.getByLabel('Mot de passe').fill('lea');
    await page.getByRole('checkbox', { name: 'Se souvenir de moi' }).check();
    await page.getByRole('main').getByRole('button', { name: 'Se connecter' }).click();
    await page.waitForURL('http://localhost:5173/');
    await page.goto('http://localhost:5173/tournaments');
    await page.waitForSelector('text=Vinci Easter Cup 2026', { timeout: 15000 });
    await page.locator('[data-testid="InfoOutlinedIcon"]').first().click();
    await expect(page.getByText('Quarts')).toBeVisible({ timeout: 5000 });
  });

  test('affiche le nom du tournoi', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 4 })).toBeVisible();
  });

  test('affiche le bracket avec Quarts Demi Finale', async ({ page }) => {
    await expect(page.getByText('Quarts')).toBeVisible();
    await expect(page.getByText('Demi')).toBeVisible();
    await expect(page.getByText('Finale')).toBeVisible();
  });

  test('affiche le panneau Teams participantes', async ({ page }) => {
    await expect(page.getByText('Teams participantes')).toBeVisible();
  });

  test('affiche le panneau Inscriptions', async ({ page }) => {
    await expect(page.getByText('Inscriptions', { exact: true })).toBeVisible();
    await expect(page.getByText(/Date limite le/)).toBeVisible();
  });

  test('affiche les équipes inscrites', async ({ page }) => {
    await expect(page.getByText('TEAM_ALPHA')).toBeVisible({ timeout: 5000 });
  });

});

test.describe('Tournament Detail - Gagnant', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByLabel('Adresse email').fill('lea@mail.com');
    await page.getByLabel('Mot de passe').fill('lea');
    await page.getByRole('checkbox', { name: 'Se souvenir de moi' }).check();
    await page.getByRole('main').getByRole('button', { name: 'Se connecter' }).click();
    await page.waitForURL('http://localhost:5173/');
    await page.goto('http://localhost:5173/tournaments');
    await page.waitForSelector('text=Terminés', { timeout: 15000 });
    await page.getByLabel('Terminés').click();
    await page.waitForTimeout(500);
    await page.locator('[data-testid="InfoOutlinedIcon"]').first().click();
    await expect(page.getByText('Quarts')).toBeVisible({ timeout: 5000 });
  });

  test('affiche le gagnant pour un tournoi terminé', async ({ page }) => {
    await expect(page.getByText('🏆 Gagnant')).toBeVisible({ timeout: 5000 });
  });

});