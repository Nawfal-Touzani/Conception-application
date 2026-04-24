import { test, expect } from '@playwright/test';

test.describe('Tournaments Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByLabel('Adresse email').fill('lea@mail.com');
    await page.getByLabel('Mot de passe').fill('lea');
    await page.getByRole('checkbox', { name: 'Se souvenir de moi' }).check();
    await page.getByRole('main').getByRole('button', { name: 'Se connecter' }).click();
    await page.waitForURL('http://localhost:5173/');
    await page.goto('http://localhost:5173/tournaments');
    await page.waitForSelector('text=Spring Battle Series 2026', { timeout: 15000 });
  });

  test('affiche la page des tournois', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tournois' })).toBeVisible();
  });

  test('affiche la liste des tournois', async ({ page }) => {
    await expect(page.getByText('Spring Battle Series 2026')).toBeVisible();
  });

  test('affiche le panneau de filtres', async ({ page }) => {
    await expect(page.getByText('FILTRES')).toBeVisible();
    await expect(page.getByText('Nom', { exact: true })).toBeVisible();
    await expect(page.getByText('Team', { exact: true })).toBeVisible();
    await expect(page.getByText('Tag', { exact: true })).toBeVisible();
    await expect(page.getByText('État', { exact: true })).toBeVisible();
  });

  test('filtre par nom fonctionne', async ({ page }) => {
    await page.getByPlaceholder('Rechercher...').first().fill('Easter');
    await expect(page.getByText('Vinci Easter Cup 2026')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Spring Battle Series 2026')).not.toBeVisible();
  });

  test('filtre par statut En Cours fonctionne', async ({ page }) => {
    await page.getByLabel('En cours').click();
    await expect(page.getByText('Spring Battle Series 2026')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Vinci Easter Cup 2026')).not.toBeVisible();
  });

  test('filtre par statut Inscriptions ouvertes fonctionne', async ({ page }) => {
    await page.getByLabel('Inscriptions ouvertes').click();
    await page.waitForTimeout(500);
    // Elite Championship 2026 est ouvert (15/16 places)
    await expect(page.getByText('Elite Championship 2026')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Spring Battle Series 2026')).not.toBeVisible();
  });

  test('réinitialiser les filtres fonctionne', async ({ page }) => {
    await page.getByPlaceholder('Rechercher...').first().fill('Easter');
    await expect(page.getByText('Spring Battle Series 2026')).not.toBeVisible();
    await page.getByRole('button', { name: 'Réinitialiser' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Spring Battle Series 2026')).toBeVisible({ timeout: 5000 });
  });

  test('clic sur info ouvre le détail du tournoi', async ({ page }) => {
    await page.locator('[data-testid="InfoOutlinedIcon"]').first().click();
    await expect(page.getByText('Teams participantes')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Début', { exact: true })).toBeVisible();
    await expect(page.getByText('Fin', { exact: true })).toBeVisible();
  });

  test('bouton retour depuis le détail revient à la liste', async ({ page }) => {
    await page.locator('[data-testid="InfoOutlinedIcon"]').first().click();
    await expect(page.getByText('Teams participantes')).toBeVisible({ timeout: 5000 });
    await page.locator('[data-testid="ArrowBackIcon"]').click();
    await expect(page.getByRole('heading', { name: 'Tournois' })).toBeVisible({ timeout: 5000 });
  });

  test('affiche le bouton Administrer pour un admin', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Administrer' }).first()).toBeVisible();
  });

  test('le bouton Administrer est désactivé pour un tournoi terminé', async ({ page }) => {
    await page.getByLabel('Terminés').click();
    await page.waitForTimeout(500);
    const btn = page.getByRole('button', { name: 'Administrer' }).first();
    await expect(btn).toBeDisabled({ timeout: 5000 });
  });

});