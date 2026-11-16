import { defineConfig, devices } from '@playwright/test';

// Own ports, so it never races `bun run dev` (5000/5100) nor the API e2e suite (5300/5301).
const API_URL = 'http://localhost:5401';
export const WEB_URL = 'http://localhost:5402';

const CI = !!process.env.CI;

export default defineConfig({
  testDir: 'e2e',
  // Vite's watcher skips `test-results/`, so trace snapshots (.html) never reload the page.
  outputDir: 'reports/test-results/',
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
  ],
  webServer: [
    {
      name: 'API',
      command: 'bun run start:e2e',
      cwd: '../api',
      url: `${API_URL}/api/health`,
      timeout: 120_000,
      reuseExistingServer: !CI,
      env: {
        PORT: '5401',
        DATABASE_URL: 'postgres://postgres:postgres@127.0.0.1:5400/postgres',
        BETTER_AUTH_URL: API_URL,
        WEB_URL,
      },
    },
    {
      name: 'Web',
      command: 'vite --port 5402 --strictPort',
      url: WEB_URL,
      reuseExistingServer: !CI,
      env: { API_URL },
    },
  ],
  use: {
    baseURL: WEB_URL,
    trace: 'on-first-retry',
    locale: 'pt-BR',
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 7'] } },
  ],
});
