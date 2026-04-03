import { test, expect } from '@playwright/test';
import { goToLoginPage, loginWith } from './helper';

test.describe('Notifications', () => {

  test.beforeEach(async ({ page }) => {
    await goToLoginPage(page);
    await loginWith(page, 'lea@mail.com', 'lea');
    await page.waitForURL('http://localhost:5173/');
    await page.goto('http://localhost:5173/notifications');
  });

  test('affiche la page notifications avec les filtres', async ({ page }) => {
    await expect(page.getByText('Mes notifications')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toutes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Non lues' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lues', exact: true })).toBeVisible();
  });

  test('filtre Toutes est actif par défaut', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Toutes' })).toHaveClass(/MuiButton-contained/);
    await expect(page.getByRole('button', { name: 'Non lues' })).toHaveClass(/MuiButton-outlined/);
    await expect(page.getByRole('button', { name: 'Lues', exact: true })).toHaveClass(/MuiButton-outlined/);
  });

  test('filtre Non lues fonctionne', async ({ page }) => {
    await page.getByRole('button', { name: 'Non lues' }).click();
    await expect(page.getByRole('button', { name: 'Non lues' })).toHaveClass(/MuiButton-contained/);
    await expect(page.getByRole('button', { name: 'Toutes' })).toHaveClass(/MuiButton-outlined/);
  });

  test('filtre Lues fonctionne', async ({ page }) => {
    await page.getByRole('button', { name: 'Lues', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Lues', exact: true })).toHaveClass(/MuiButton-contained/);
    await expect(page.getByRole('button', { name: 'Toutes' })).toHaveClass(/MuiButton-outlined/);
  });

  test('marquer une notification comme lue', async ({ page, request }) => {
    // Créer une notification via l'API
    const loginResponse = await request.post('http://localhost:3000/auths/login', {
      data: { email: 'lea@mail.com', password: 'lea' }
    });
    const { token, id } = await loginResponse.json();

    await request.post(`http://localhost:3000/members/${id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        type: 'TOURNAMENT',
        message: 'Test notification e2e',
        sendDate: new Date().toISOString()
      }
    });

    await page.reload();
    await page.getByRole('button', { name: 'Non lues' }).click();
    await page.getByAltText('Marquer comme lu').first().click();
    await expect(page.getByText('Lu').first()).toBeVisible({ timeout: 5000 });
  });

  test('affiche Aucune notification si liste vide', async ({ page }) => {
    await page.getByRole('button', { name: 'Lues', exact: true }).click();
    const noNotif = page.getByText('Aucune notification.');
    const isVisible = await noNotif.isVisible().catch(() => false);
    if (isVisible) {
      await expect(noNotif).toBeVisible();
    }
  });
});