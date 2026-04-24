import { test, expect, Page } from '@playwright/test';
import { goToLoginPage, loginWith } from './helper';

const fillDate = async (page: Page, index: number, value: string) => {
  const input = page.locator('input[type="date"]').nth(index);
  await input.fill(value);
};

const fillMaxParticipants = async (page: Page, count: number) => {
  const input = page.locator('input[type="number"]');
  await input.fill(String(count));
};

test.describe('Create Tournament', () => {

  test.beforeEach(async ({ page }) => {
    await goToLoginPage(page);
    await loginWith(page, 'tibo@mail.com', 'tibo');
    await page.waitForURL('http://localhost:5173/');
    await page.goto('http://localhost:5173/tournament/create');
  });

  test('login fonctionne correctement', async ({ page }) => {
    await expect(page).not.toHaveURL(/login/);
  });

  test('formulaire vide affiche les erreurs', async ({ page }) => {
    await page.getByRole('button', { name: 'Créer le tournoi' }).click();
    await expect(page.getByText('Le nom est requis.')).toBeVisible();
    await expect(page.getByText('La description est requise.')).toBeVisible();
    await expect(page.getByText('La date de début est requise.')).toBeVisible();
  });

  test('date de début dans le passé', async ({ page }) => {
    await page.getByPlaceholder('Nom du tournoi').fill('Tournoi Test');
    await page.getByPlaceholder('Description').fill('Description');
    await fillDate(page, 0, '2020-01-01');
    await fillDate(page, 1, '2020-01-05');
    await fillDate(page, 2, '2019-12-30');
    await fillMaxParticipants(page, 8);
    await page.getByRole('button', { name: 'Créer le tournoi' }).click();
    await expect(
      page.getByText('La date de début ne peut pas être dans le passé.')
    ).toBeVisible();
  });

  test('date de fin avant date de début', async ({ page }) => {
    await page.getByPlaceholder('Nom du tournoi').fill('Tournoi Test');
    await page.getByPlaceholder('Description').fill('Description');
    await fillDate(page, 0, '2030-06-10');
    await fillDate(page, 1, '2030-06-05');
    await fillDate(page, 2, '2030-06-01');
    await fillMaxParticipants(page, 8);
    await page.getByRole('button', { name: 'Créer le tournoi' }).click();
    await expect(
      page.getByText('La date de fin doit être après la date de début.')
    ).toBeVisible();
  });

  test('max participants pas puissance de 2 non disponible dans le select', async ({ page }) => {
    await page.getByPlaceholder('Nom du tournoi').fill('Tournoi Test');
    await page.getByPlaceholder('Description').fill('Description');
    await fillDate(page, 0, '2030-06-10');
    await fillDate(page, 1, '2030-06-12');
    await fillDate(page, 2, '2030-06-05');
    await page.getByRole('button', { name: 'Créer le tournoi' }).click();
    await expect(
      page.getByText('Le nombre de participants doit être au minimum 2.')
    ).toBeVisible();
  });

  test("date limite d'inscription après date de début affiche une erreur", async ({ page }) => {
    await page.getByPlaceholder('Nom du tournoi').fill('Tournoi Test');
    await page.getByPlaceholder('Description').fill('Description');
    await fillDate(page, 0, '2030-06-10');
    await fillDate(page, 1, '2030-06-12');
    await fillDate(page, 2, '2030-06-11');
    await fillMaxParticipants(page, 8);
    await page.getByRole('button', { name: 'Créer le tournoi' }).click();
    await expect(
      page.getByText("La date limite d'inscription doit être avant la date de début.")
    ).toBeVisible();
  });

  test('formulaire vide affiche aussi les erreurs de date et participants', async ({ page }) => {
    await page.getByRole('button', { name: 'Créer le tournoi' }).click();
    await expect(page.getByText('La date de fin est requise.')).toBeVisible();
    await expect(page.getByText("La date limite d'inscription est requise.")).toBeVisible();
    await expect(page.getByText('Le nombre de participants doit être au minimum 2.')).toBeVisible();
  });

  test('bouton Annuler remet le formulaire à zéro', async ({ page }) => {
    await page.getByPlaceholder('Nom du tournoi').fill('Tournoi Test');
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.getByPlaceholder('Nom du tournoi')).toHaveValue('');
  });

});