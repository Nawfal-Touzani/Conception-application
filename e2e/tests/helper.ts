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


const goToProfilePage = async (page: Page) => {
  await page.goto("/members/me");
};

const openChangePasswordModal = async (page: Page) => {
  await page.getByRole("button", { name: "Modifier le mot de passe" }).click();
};

const fillChangePasswordForm = async (
  page: Page,
  {
    oldPassword,
    newPassword,
    confirmPassword,
  }: { oldPassword: string; newPassword: string; confirmPassword: string },
) => {
  await page.locator('input[name="oldPassword"]').fill(oldPassword);
  await page.locator('input[name="newPassword"]').fill(newPassword);
  await page.locator('input[name="confirmPassword"]').fill(confirmPassword);
};

const submitChangePasswordForm = async (page: Page) => {
  await page.getByRole("button", { name: "Confirmer" }).click();
};

const changePasswordWith = async (
  page: Page,
  {
    oldPassword,
    newPassword,
    confirmPassword,
  }: { oldPassword: string; newPassword: string; confirmPassword: string },
) => {
  await openChangePasswordModal(page);
  await fillChangePasswordForm(page, { oldPassword, newPassword, confirmPassword });
  await submitChangePasswordForm(page);
};

const ADMIN_CREDENTIALS = {
  email: "admin@vinci.be",
  password: "admin",
};

const goToAdminMembersPage = async (page: Page) => {
  await page.goto("http://localhost:5174/admin/members");
};

const loginAsAdmin = async (page: Page) => {
  await page.goto("http://localhost:5174/login");
  await loginWith(
    page,
    ADMIN_CREDENTIALS.email,
    ADMIN_CREDENTIALS.password,
    false,
  );
  await page.waitForURL("http://localhost:5174/", { timeout: 10000 });
};

const banMember = async (page: Page, memberTag: string, reason: string) => {
  await page
    .getByTestId(`member-row-${memberTag}`)
    .getByRole("button", { name: "Bannir le membre" })
    .click();

  await page.getByLabel("Raison du bannissement").fill(reason);
  await page.getByRole("button", { name: "Confirmer" }).click();
};

export {
  goToRegisterPage,
  goToLoginPage,
  goToProfilePage,
  fillRegisterForm,
  fillLoginForm,
  submitRegisterForm,
  submitLoginForm,
  registerWith,
  loginWith,
  openChangePasswordModal,
  fillChangePasswordForm,
  submitChangePasswordForm,
  changePasswordWith,
  generateValidCredentials,
  ADMIN_CREDENTIALS,
  goToAdminMembersPage,
  loginAsAdmin,
  banMember,
};

