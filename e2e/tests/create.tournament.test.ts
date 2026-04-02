import { test, expect, Page } from '@playwright/test';

const fillDate = async (page: Page, index: number, value: string) => {
  const input = page.locator('input[type="date"]').nth(index);
  await input.fill(value);
};

test.describe('Create Tournament', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByLabel('Adresse email').fill('tibo@mail.com');
    await page.getByLabel('Mot de passe').fill('tibo');
    await page.getByRole('checkbox', { name: 'Se souvenir de moi' }).check();
    await page.getByRole('main').getByRole('button', { name: 'Se connecter' }).click();
    await page.waitForURL('http://localhost:5173/');
    await page.goto('http://localhost:5173/tournament/create');
  });

  test('login fonctionne correctement', async ({ page }) => {
    await expect(page).not.toHaveURL(/login/);
  });

test('création réussie', async ({ page }) => {
  const tournamentName = `Tournoi E2E ${Date.now()}`;

  await page.getByPlaceholder('Nom du tournoi').fill(tournamentName);
  await page.getByPlaceholder('Description').fill('Une super description de test');
  await fillDate(page, 0, '2030-06-10');
  await fillDate(page, 1, '2030-06-12');
  await fillDate(page, 2, '2030-06-05');
  await page.getByPlaceholder('Doit être une puissance de deux').fill('8');
  await page.getByRole('button', { name: 'Créer le tournoi' }).click();
  await page.pause();
  await expect(page.getByText(/a été créé avec succès/)).toBeVisible({ timeout: 10000 });
});

  test('formulaire vide affiche les erreurs', async ({ page }) => {
    await page.click('button:has-text("Créer le tournoi")');
    await expect(page.getByText('Le nom est requis.')).toBeVisible();
    await expect(page.getByText('La description est requise.')).toBeVisible();
    await expect(page.getByText('La date de début est requise.')).toBeVisible();
  });

  test('date de début dans le passé', async ({ page }) => {
    await page.fill('[placeholder="Nom du tournoi"]', 'Tournoi Test');
    await page.fill('[placeholder="Description"]', 'Description');
    await fillDate(page, 0, '2020-01-01');
    await fillDate(page, 1, '2020-01-05');
    await fillDate(page, 2, '2019-12-30');
    await page.fill('[placeholder="Doit être une puissance de deux"]', '8');
    await page.click('button:has-text("Créer le tournoi")');
    await expect(
      page.getByText('La date de début ne peut pas être dans le passé.')
    ).toBeVisible();
  });

  test('date de fin avant date de début', async ({ page }) => {
    await page.fill('[placeholder="Nom du tournoi"]', 'Tournoi Test');
    await page.fill('[placeholder="Description"]', 'Description');
    await fillDate(page, 0, '2030-06-10');
    await fillDate(page, 1, '2030-06-05');
    await fillDate(page, 2, '2030-06-01');
    await page.fill('[placeholder="Doit être une puissance de deux"]', '8');
    await page.click('button:has-text("Créer le tournoi")');
    await expect(
      page.getByText('La date de fin doit être après la date de début.')
    ).toBeVisible();
  });

  test('max participants pas puissance de 2', async ({ page }) => {
    await page.fill('[placeholder="Nom du tournoi"]', 'Tournoi Test');
    await page.fill('[placeholder="Description"]', 'Description');
    await fillDate(page, 0, '2030-06-10');
    await fillDate(page, 1, '2030-06-12');
    await fillDate(page, 2, '2030-06-05');
    await page.fill('[placeholder="Doit être une puissance de deux"]', '7');
    await page.click('button:has-text("Créer le tournoi")');
    await expect(
      page.getByText('Le nombre de participants doit être une puissance de 2.')
    ).toBeVisible();
  });

 test('nom déjà existant affiche erreur 409', async ({ page }) => {
  const tournamentName = `Tournoi Doublon ${Date.now()}`;

  // 1ère soumission — crée le tournoi
  await page.fill('[placeholder="Nom du tournoi"]', tournamentName);
  await page.fill('[placeholder="Description"]', 'Description');
  await fillDate(page, 0, '2030-06-10');
  await fillDate(page, 1, '2030-06-12');
  await fillDate(page, 2, '2030-06-05');
  await page.fill('[placeholder="Doit être une puissance de deux"]', '8');
  await page.click('button:has-text("Créer le tournoi")');
  await expect(
    page.getByText(new RegExp(`Le tournoi "${tournamentName}" a été créé avec succès`))
  ).toBeVisible({ timeout: 10000 });

  // Attends que le formulaire soit resetté
  await expect(page.locator('[placeholder="Nom du tournoi"]')).toHaveValue('', { timeout: 5000 });

  // 2ème soumission — même nom → 409
  await page.fill('[placeholder="Nom du tournoi"]', tournamentName);
  await page.fill('[placeholder="Description"]', 'Description');
  await fillDate(page, 0, '2030-07-10');
  await fillDate(page, 1, '2030-07-12');
  await fillDate(page, 2, '2030-07-05');
  await page.fill('[placeholder="Doit être une puissance de deux"]', '8');
  await page.click('button:has-text("Créer le tournoi")');
  await expect(
    page.getByText('Un tournoi avec ce nom existe déjà.')
  ).toBeVisible({ timeout: 10000 });
});
  test('bouton Annuler remet le formulaire à zéro', async ({ page }) => {
    await page.fill('[placeholder="Nom du tournoi"]', 'Tournoi Test');
    await page.click('button:has-text("Annuler")');
    await expect(page.locator('[placeholder="Nom du tournoi"]')).toHaveValue('');
  });

});