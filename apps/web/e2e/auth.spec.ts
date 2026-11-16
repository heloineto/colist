import type { Page } from '@playwright/test';
import { type Account, expect, newAccount, signUp, test } from './fixtures';

test.use({ storageState: { cookies: [], origins: [] } });

/** Both forms are always mounted (the panel slides), so scope by submit button. */
function authForm(page: Page, submit: string) {
  return page
    .locator('form')
    .filter({ has: page.getByRole('button', { name: submit, exact: true }) });
}

async function signIn(page: Page, { email, password }: Account) {
  const form = authForm(page, 'Entrar');
  await form.getByLabel('E-mail').fill(email);
  await form.getByLabel('Senha', { exact: true }).fill(password);
  await form.getByRole('button', { name: 'Entrar', exact: true }).click();
}

test('signs up, signs out and signs back in', async ({ page }, testInfo) => {
  const account = newAccount(testInfo.workerIndex);
  const profile = page.getByRole('button', { name: 'profile' });
  await page.goto('/auth');

  await page.getByRole('button', { name: 'Criar uma conta' }).click();
  const form = authForm(page, 'Criar conta');
  await form.getByLabel('Nome').fill(account.name);
  await form.getByLabel('E-mail').fill(account.email);
  await form.getByLabel('Senha', { exact: true }).fill(account.password);
  await form.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(profile).toBeVisible();

  await profile.click();
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page).toHaveURL(/\/auth$/);

  await signIn(page, account);
  await expect(page).toHaveURL(/\/app$/);
  await expect(profile).toBeVisible();
});

test('rejects a wrong password', async ({ page, playwright }, testInfo) => {
  const account = newAccount(testInfo.workerIndex);
  await signUp(playwright.request, account);
  await page.goto('/auth');

  await signIn(page, { ...account, password: 'Wrong-e2e-123' });
  await expect(page.getByText('E-mail ou senha inválidos')).toBeVisible();
  await expect(page).toHaveURL(/\/auth$/);
});

test('redirects /app to /auth when signed out', async ({ page }) => {
  await page.goto('/app');
  await expect(page).toHaveURL(/\/auth$/);
});
