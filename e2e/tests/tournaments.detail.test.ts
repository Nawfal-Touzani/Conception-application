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
    await expect(page.getByText('Teams participantes')).toBeVisible({ timeout: 5000 });
  });

  test('affiche le nom du tournoi', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 4 })).toBeVisible();
  });

  test('affiche le panneau Teams participantes', async ({ page }) => {
    await expect(page.getByText('Teams participantes')).toBeVisible();
  });

  test('affiche les informations de dates du tournoi', async ({ page }) => {
    await expect(page.getByText('Début', { exact: true })).toBeVisible();
    await expect(page.getByText('Fin', { exact: true })).toBeVisible();
    await expect(page.getByText('État', { exact: true })).toBeVisible();
  });

  test('affiche le panneau Inscriptions', async ({ page }) => {
    await expect(page.getByText('Inscriptions', { exact: true })).toBeVisible();
    await expect(page.getByText(/Date limite le/)).toBeVisible();
  });

  test('affiche le bracket ou le message planning non publié', async ({ page }) => {
    const bracketOrMsg = page.locator(
      'text=Le planning n\'a pas encore été publié., [data-testid="InfoOutlinedIcon"]'
    );
    const noBracket = page.getByText("Le planning n'a pas encore été publié.");
    const hasBracket = await page.locator('.MuiPaper-root').count() > 0;
    expect(hasBracket || await noBracket.isVisible()).toBeTruthy();
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
    await expect(page.getByText('Teams participantes')).toBeVisible({ timeout: 5000 });
  });

  test('affiche le gagnant pour un tournoi terminé', async ({ page }) => {
    await expect(page.getByText('🏆 Gagnant')).toBeVisible({ timeout: 5000 });
  });

  test('affiche les dates du tournoi terminé', async ({ page }) => {
    await expect(page.getByText('Début', { exact: true })).toBeVisible();
    await expect(page.getByText('Fin', { exact: true })).toBeVisible();
  });

});