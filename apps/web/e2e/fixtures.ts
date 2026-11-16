import path from 'node:path';
import {
  type APIRequest,
  type Locator,
  type Page,
  test as base,
  expect,
} from '@playwright/test';
import { WEB_URL } from '../playwright.config';

export type Account = { name: string; email: string; password: string };

/** Fresh credentials; the DB is thrown away each run, so no cleanup. */
export function newAccount(workerIndex: number): Account {
  return {
    name: 'E2E User',
    email: `e2e-${workerIndex}-${Date.now()}@colist.test`,
    password: 'Colist-e2e-123',
  };
}

/** Real sign-up through better-auth; `Origin` must be the web origin it trusts. */
export async function signUp(
  request: APIRequest,
  account: Account,
  storagePath?: string
) {
  const context = await request.newContext({
    baseURL: WEB_URL,
    extraHTTPHeaders: { Origin: WEB_URL },
  });
  try {
    const response = await context.post('/api/auth/sign-up/email', {
      data: account,
    });
    await expect(response).toBeOK();
    return await context.storageState({ path: storagePath });
  } finally {
    await context.dispose();
  }
}

/** Unique per test, so tests sharing a worker's account never see each other's lists. */
export function uniqueName(prefix: string) {
  return `${prefix} ${Date.now().toString(36)}`;
}

export async function createList(page: Page, name: string) {
  await page.getByRole('tab', { name: 'Nova lista', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Nova lista' });
  await dialog.getByLabel('Nome').fill(name);
  await dialog.getByRole('button', { name: 'Criar' }).click();
  await expect(page.getByRole('tab', { name })).toHaveAttribute(
    'aria-selected',
    'true'
  );
}

export async function addItem(page: Page, toolbar: Locator, name: string) {
  await toolbar.getByRole('button', { name: 'Adicionar item' }).click();
  const input = page.getByPlaceholder('Novo item');
  await input.fill(name);
  await input.press('Enter');
  await expect(page.getByRole('checkbox', { name })).toBeVisible();
}

type WorkerFixtures = { account: Account & { storagePath: string } };
type TestFixtures = {
  secondUser: Account & { page: Page };
  toolbar: Locator;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // One account per worker: tests write server state, so they must not share one.
  account: [
    async ({ playwright }, use, workerInfo) => {
      const account = newAccount(workerInfo.workerIndex);
      const storagePath = path.join(
        import.meta.dirname,
        '../playwright/.auth',
        `${workerInfo.workerIndex}.json`
      );
      await signUp(playwright.request, account, storagePath);
      await use({ ...account, storagePath });
    },
    { scope: 'worker' },
  ],
  storageState: async ({ account }, use) => {
    await use(account.storagePath);
  },
  // Toolbar actions live in the navbar on desktop and in the footer on mobile.
  toolbar: async ({ page, isMobile }, use) => {
    await use(page.getByRole(isMobile ? 'contentinfo' : 'navigation').first());
  },
  // A second signed-in browser, for sharing and realtime flows.
  secondUser: async ({ playwright, browser }, use, testInfo) => {
    const account = newAccount(testInfo.workerIndex);
    const storageState = await signUp(playwright.request, account);
    const context = await browser.newContext({ storageState });
    await use({ ...account, page: await context.newPage() });
    await context.close();
  },
});

export { expect };
