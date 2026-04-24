import { test, expect } from '@playwright/test';
import { goToLoginPage, loginWith } from './helper';

test.describe('ActionSidebar membre avec équipe', () => {

  test.beforeEach(async ({ page }) => {
    await goToLoginPage(page);
    await loginWith(page, 'lea@mail.com', 'lea');
    await page.waitForURL('http://localhost:5173/');
    await page.goto('http://localhost:5173/members/me');
    await page.waitForSelector('text=Actions', { timeout: 10000 });
  });

  test('affiche le panneau Actions', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Actions' })).toBeVisible();
  });

  test('affiche le bouton Consulter mes tournois disputés', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Consulter mes tournois disputés' })
    ).toBeVisible();
  });

  test('affiche le bouton Visualiser mes tournois à venir', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Visualiser mes tournois à venir' })
    ).toBeVisible();
  });

  test('ne affiche pas le bouton Rejoindre une team si déjà dans une équipe', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Rejoindre une team' })
    ).not.toBeVisible();
  });

  test('le bouton tournois disputés va vers la page tournois filtrée', async ({ page }) => {
    await page.getByRole('button', { name: 'Consulter mes tournois disputés' }).click();
    await page.waitForURL(/\/tournaments/, { timeout: 5000 });
    await expect(page.url()).toContain('status=FINISHED');
    await expect(page.url()).toContain('tag=Lynx');
  });

  test('le bouton tournois à venir va vers la page tournois filtrée', async ({ page }) => {
    await page.getByRole('button', { name: 'Visualiser mes tournois à venir' }).click();
    await page.waitForURL(/\/tournaments/, { timeout: 5000 });
    await expect(page.url()).toContain('status=OPEN');
    await expect(page.url()).toContain('tag=Lynx');
  });

});

test.describe('ActionSidebar si membre sans équipe', () => {

  test.beforeEach(async ({ page }) => {
    await goToLoginPage(page);
    await loginWith(page, 'admin@vinci.be', 'admin');
    await page.waitForURL('http://localhost:5173/');
    await page.goto('http://localhost:5173/members/me');
    await page.waitForSelector('text=Actions', { timeout: 10000 });
  });

  test('affiche le bouton Rejoindre une team si pas dans une équipe', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Rejoindre une team' })
    ).toBeVisible();
  });

  test('le bouton Rejoindre une team navigue vers /team', async ({ page }) => {
    await page.getByRole('button', { name: 'Rejoindre une team' }).click();
    await page.waitForURL('http://localhost:5173/team', { timeout: 5000 });
    await expect(page).toHaveURL('http://localhost:5173/team');
  });

});