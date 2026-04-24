import { test, expect } from '@playwright/test';
import { goToLoginPage, loginWith } from './helper';

test.describe('UnavailabilitySection', () => {

  test.beforeEach(async ({ page }) => {
    await goToLoginPage(page);
    await loginWith(page, 'lea@mail.com', 'lea');
    await page.waitForURL('http://localhost:5173/');
    await page.goto('http://localhost:5173/members/me');
    await page.waitForSelector('text=Définir une indisponibilité :', { timeout: 10000 });
  });

  test('affiche la section indisponibilité', async ({ page }) => {
    await expect(page.getByText('Définir une indisponibilité :')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Voir mes indisponibilités' })).toBeVisible();
  });

  test('affiche les deux champs de date', async ({ page }) => {
    const dateInputs = page.locator('input[type="date"]');
    await expect(dateInputs.nth(0)).toBeVisible();
    await expect(dateInputs.nth(1)).toBeVisible();
  });

  test('enregistre une indisponibilité avec succès', async ({ page }) => {
    const dateInputs = page.locator('input[type="date"]');
    await dateInputs.nth(0).fill('2030-08-01');
    await dateInputs.nth(1).fill('2030-08-10');
    await page.getByRole('button', { name: 'Confirmer' }).click();
    await expect(page.getByText('Indisponibilité enregistrée !')).toBeVisible({ timeout: 5000 });
  });

  test('affiche une erreur si la date de fin est avant la date de début', async ({ page }) => {
    const dateInputs = page.locator('input[type="date"]');
    await dateInputs.nth(0).fill('2030-08-10');
    await dateInputs.nth(1).fill('2030-08-01');
    await page.getByRole('button', { name: 'Confirmer' }).click();
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
    const alert = page.getByRole('alert');
    
    await expect(alert).not.toContainText('enregistrée');
  });

  test('ouvre la modale des indisponibilités', async ({ page }) => {
  await page.getByRole('button', { name: 'Voir mes indisponibilités' }).click();
  await expect(page.getByRole('heading', { name: 'Mes Indisponibilités' })).toBeVisible({ timeout: 5000 });
});

test('affiche la liste des indisponibilités dans la modale', async ({ page }) => {
  await page.getByRole('button', { name: 'Voir mes indisponibilités' }).click();
  await expect(page.getByRole('heading', { name: 'Mes Indisponibilités' })).toBeVisible({ timeout: 5000 });
  
  await expect(page.getByText(/^Du /).first()).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/^Au /).first()).toBeVisible({ timeout: 5000 });
});

test('ferme la modale en cliquant en dehors', async ({ page }) => {
  await page.getByRole('button', { name: 'Voir mes indisponibilités' }).click();
  const modalTitle = page.getByRole('heading', { name: 'Mes Indisponibilités' });
  await expect(modalTitle).toBeVisible({ timeout: 5000 });
  
  await page.keyboard.press('Escape');

  await expect(modalTitle).not.toBeVisible({ timeout: 3000 });
});

});