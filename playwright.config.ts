import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:3100', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    { name: 'fixture engine', command: 'node e2e/fixtures/server.mjs', url: 'http://127.0.0.1:4010/health/ready', reuseExistingServer: false, timeout: 30_000 },
    {
      name: 'console',
      command: 'corepack pnpm build && corepack pnpm --filter @quorumscope/web exec next start -p 3100',
      url: 'http://127.0.0.1:3100/api/health',
      env: { NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL: 'http://127.0.0.1:4010' },
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
