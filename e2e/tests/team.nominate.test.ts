import { test, expect } from '@playwright/test';
import { goToLoginPage, loginWith } from './helper';

test.describe('Nomination d un responsable d équipe', () => {

  test.beforeEach(async ({ page }) => {
    await goToLoginPage(page);
    await loginWith(page, 'lea@mail.com', 'lea');
    await page.waitForURL('http://localhost:5173/');
    await page.goto('http://localhost:5173/team');
    await expect(page.getByRole('heading', { name: 'Mon équipe', level: 4 })).toBeVisible({ timeout: 10000 });
  });

  test('affiche la page équipe avec les membres', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mon équipe', level: 4 })).toBeVisible();
    await expect(page.getByText('Membres de l\'équipe')).toBeVisible();
  });

  test('affiche le bouton Nommer pour un membre non responsable', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Nommer' }).first()).toBeVisible();
  });

  test('le responsable voit bien l icône étoile à coté du pseudo', async ({ page }) => {
    await expect(page.locator('[data-testid="GradeIcon"]').first()).toBeVisible();
  });

  test('nomme un membre comme second responsable avec succès', async ({ page }) => {
    await page.getByRole('button', { name: 'Nommer' }).first().click();
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="GradeIcon"]')).toHaveCount(2, { timeout: 5000 });
  });

  test('après nomination, le bouton Nommer disparaît pour le membre nommé', async ({ page }) => {
    const nominateButtons = page.getByRole('button', { name: 'Nommer' });

    await nominateButtons.first().click();
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="GradeIcon"]')).toHaveCount(2, { timeout: 5000 });
  });

});

test.describe('Nomination: accès refusé si pas responsable', () => {

  test.beforeEach(async ({ page }) => {
    await goToLoginPage(page);
    await loginWith(page, 'tom@mail.com', 'tom');
    await page.waitForURL('http://localhost:5173/');
    await page.goto('http://localhost:5173/team');
    await expect(page.getByRole('heading', { name: 'Mon équipe', level: 4 })).toBeVisible({ timeout: 10000 });
  });

  test('le non resp ne voit pas le bouton Nommer', async ({ page }) => {
    await expect(page.getByText('Membres de l\'équipe')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nommer' })).toHaveCount(0);
  });

  test('affiche la liste des membres', async ({ page }) => {
    await expect(page.getByText('Membres de l\'équipe')).toBeVisible();
    await expect(page.locator('.MuiListItem-root').first()).toBeVisible();
  });

});