import { test, expect } from '@playwright/test';

test.describe('Team Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByLabel('Adresse email').fill('lea@mail.com');
    await page.getByLabel('Mot de passe').fill('lea');
    await page.getByRole('checkbox', { name: 'Se souvenir de moi' }).check();
    await page.getByRole('main').getByRole('button', { name: 'Se connecter' }).click();
    await page.waitForURL('http://localhost:5173/');
    await page.goto('http://localhost:5173/team');
    await page.waitForSelector('text=Mon équipe', { timeout: 10000 });
  });

  test('affiche le titre Mon équipe', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mon équipe' })).toBeVisible({ timeout: 10000 });
  });

  test("affiche le nom de l'équipe", async ({ page }) => {
    await expect(page.getByText('TEAM_ALPHA')).toBeVisible({ timeout: 10000 });
  });

  test('affiche le responsable', async ({ page }) => {
    await expect(page.getByText('Responsable :', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Lynx').first()).toBeVisible({ timeout: 10000 });
  });

  test("affiche les membres de l'équipe", async ({ page }) => {
    await expect(page.getByText("Membres de l'équipe")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Rogue')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Pulse', { exact: true }).first()).toBeVisible({ timeout: 10000 });
  });

  test('affiche les onglets Tournois', async ({ page }) => {
    await expect(page.getByText(/En cours \(/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/À venir \(/)).toBeVisible({ timeout: 10000 });
  });

  test('affiche les tournois en cours de la team', async ({ page }) => {
    await page.getByText(/En cours \(/).click();
    await expect(page.getByText('Spring Battle Series 2026')).toBeVisible({ timeout: 10000 });
  });

  test('le bouton Quitter est visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Quitter' })).toBeVisible({ timeout: 10000 });
  });

  test('ouvre le dialog de confirmation en cliquant Quitter', async ({ page }) => {
    await page.getByRole('button', { name: 'Quitter' }).click();
    await expect(page.getByRole('heading', { name: "Quitter l'équipe" })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Es-tu sûr/)).toBeVisible();
  });

  test('ferme le dialog en cliquant Annuler', async ({ page }) => {
    await page.getByRole('button', { name: 'Quitter' }).click();
    await expect(page.getByRole('heading', { name: "Quitter l'équipe" })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.getByRole('heading', { name: "Quitter l'équipe" })).not.toBeVisible();
  });

  test('affiche le bouton Nommer pour le responsable', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Nommer' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('clic sur un membre navigue vers son profil', async ({ page }) => {
    await page.waitForSelector('text=Rogue', { timeout: 10000 });
    await page.getByText('Rogue').click();
    await expect(page).toHaveURL(/\/members\//, { timeout: 5000 });
  });

});

test.describe('Team Page - Sans équipe', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByLabel('Adresse email').fill('member@vinci.be');
    await page.getByLabel('Mot de passe').fill('member');
    await page.getByRole('checkbox', { name: 'Se souvenir de moi' }).check();
    await page.getByRole('main').getByRole('button', { name: 'Se connecter' }).click();
    await page.waitForURL('http://localhost:5173/');
    await page.goto('http://localhost:5173/team');
  });

  test('affiche la page rejoindre/créer une équipe', async ({ page }) => {
    await expect(page.getByText('Rejoindre une team')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Créer une team')).toBeVisible({ timeout: 10000 });
  });

});