import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter backend dev',
      port: 3001,
      timeout: 30_000,
      reuseExistingServer: true,
    },
    {
      command: 'pnpm --filter frontend dev',
      port: 3000,
      timeout: 30_000,
      reuseExistingServer: true,
    },
  ],
});
