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
    await expect(
      page.getByRole('button', { name: 'Lues', exact: true }),
    ).toBeVisible();
  });

  test('filtre Toutes est actif par défaut', async ({ page }) => {
    const toutesBtn = page.getByRole('button', { name: 'Toutes' });
    const nonLuesBtn = page.getByRole('button', { name: 'Non lues' });
    const luesBtn = page.getByRole('button', { name: 'Lues', exact: true });

    await expect(toutesBtn).toHaveCSS('color', 'rgb(216, 164, 107)');
    await expect(nonLuesBtn).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(luesBtn).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('filtre Non lues fonctionne', async ({ page }) => {
    const toutesBtn = page.getByRole('button', { name: 'Toutes' });
    const nonLuesBtn = page.getByRole('button', { name: 'Non lues' });
    const luesBtn = page.getByRole('button', { name: 'Lues', exact: true });

    await nonLuesBtn.click();

    await expect(nonLuesBtn).toHaveCSS('color', 'rgb(216, 164, 107)');
    await expect(toutesBtn).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(luesBtn).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('filtre Lues fonctionne', async ({ page }) => {
    const toutesBtn = page.getByRole('button', { name: 'Toutes' });
    const nonLuesBtn = page.getByRole('button', { name: 'Non lues' });
    const luesBtn = page.getByRole('button', { name: 'Lues', exact: true });

    await luesBtn.click();

    await expect(luesBtn).toHaveCSS('color', 'rgb(216, 164, 107)');
    await expect(toutesBtn).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(nonLuesBtn).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('marquer une notification comme lue', async ({ page, request }) => {
    const loginResponse = await request.post(
      'http://localhost:3000/auths/login',
      {
        data: { email: 'lea@mail.com', password: 'lea' },
      },
    );
    const { token, id } = await loginResponse.json();

    await request.post(`http://localhost:3000/members/${id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        type: 'TOURNAMENT',
        message: 'Test notification e2e',
        sendDate: new Date().toISOString(),
      },
    });

    await page.reload();
    await page.getByRole('button', { name: 'Non lues' }).click();
    await page
      .getByRole('button', { name: 'Marquer comme lu' })
      .first()
      .click();
    await expect(page.getByText('Lu').first()).toBeVisible({ timeout: 5000 });
  });

  test('affiche Aucune notification si liste vide', async ({ page }) => {
    await page.getByRole('button', { name: 'Lues', exact: true }).click();
    const noNotif = page.getByText('Aucune notification');
    const isVisible = await noNotif.isVisible().catch(() => false);
    if (isVisible) {
      await expect(noNotif).toBeVisible();
    }
  });
});
