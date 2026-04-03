import { Page } from "@playwright/test";
import { faker } from "@faker-js/faker";

const goToRegisterPage = async (page: Page) => {
  await page.goto("/register");
};

const goToLoginPage = async (page: Page) => {
  await page.goto('/login');
};

const fillRegisterForm = async (page: Page, { email, password, tag }: { email: string; password: string; tag: string },) => {
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByLabel("Tag en jeu").fill(tag);

  // MUI Select
  await page.getByRole("combobox", { name: "Spécialité" }).click();
  await page.getByRole("option").first().click();

  await page.getByRole('img', { name: 'Avatar 1', exact: true }).click();
};

const fillLoginForm = async (
  page: Page,
  { email, password }: { email: string; password: string },
) => {
  await page.getByLabel('Adresse email').fill(email);
  await page.getByLabel('Mot de passe').fill(password);
};

const submitRegisterForm = async (page: Page) => {
  await page.locator('main').getByRole('button', { name: "S'inscrire" }).click();
};

const submitLoginForm = async (page: Page) => {
  await page.locator('main').getByRole('button', { name: 'Se connecter' }).click();
};

const registerWith = async (
  page: Page,
  email: string,
  password: string,
  tag: string,
) => {
  await fillRegisterForm(page, { email, password, tag });
  await submitRegisterForm(page);
};

const loginWith = async (
  page: Page,
  email: string,
  password: string,
  rememberMe = true,
) => {
  await fillLoginForm(page, { email, password });

  const rememberMeCheckbox = page.getByLabel('Se souvenir de moi');
  if (rememberMe) {
    await rememberMeCheckbox.check();
  } else {
    await rememberMeCheckbox.uncheck();
  }

  await submitLoginForm(page);
};

// Password to pass always
// Faker psw never pass
const generateValidCredentials = () => ({
  email: faker.internet.email(),
  password: "Valid1@Password",
  tag: faker.internet.username().slice(0, 15),
});

export { goToRegisterPage, goToLoginPage, fillRegisterForm, fillLoginForm, generateValidCredentials, submitRegisterForm, submitLoginForm, registerWith, loginWith };
