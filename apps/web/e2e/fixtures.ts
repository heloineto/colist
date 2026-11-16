import path from 'node:path';
import {
  type APIRequest,
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

type WorkerFixtures = { account: Account & { storagePath: string } };
type TestFixtures = { secondUser: Account & { page: Page } };

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
