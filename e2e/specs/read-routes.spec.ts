import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const keyId = 'a'.repeat(64);
const episodeId = '00000000-0000-0000-0000-000000000002';

test('overview shows engine fixture state and its network label', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /engine-reported freeze state/i })).toBeVisible();
  await expect(page.getByText('Fixture network', { exact: true })).toBeVisible();
  await expect(page.getByText('Current state unavailable')).toHaveCount(0);
});

test('network and bypass routes show source fields', async ({ page }) => {
  await page.goto('/network');
  await expect(page.getByText('Fixture network', { exact: true })).toBeVisible();
  await expect(page.getByText('12,345', { exact: true }).first()).toBeVisible();
  await page.getByRole('link', { name: 'Inspect active bypass evidence' }).click();
  await expect(page).toHaveURL('/bypasses');
  await expect(page.getByText('fixture-bypass-evidence')).toBeVisible();
});

test('frozen key list, detail, and empty page stay distinct', async ({ page }) => {
  await page.goto('/keys');
  await page.getByRole('link', { name: keyId }).click();
  await expect(page).toHaveURL(`/keys/${keyId}`);
  await expect(page.getByText('fixture-key-evidence').first()).toBeVisible();
  await page.goto('/keys?page=2');
  await expect(page.getByText('This page has no keys.')).toBeVisible();
  await expect(page.getByText('Frozen keys unavailable')).toHaveCount(0);
});

test('freeze episode list links to its evidence timeline', async ({ page }) => {
  await page.goto('/incidents');
  await page.getByRole('link', { name: episodeId }).click();
  await expect(page).toHaveURL(`/incidents/${episodeId}`);
  await expect(page.getByText('fixture-event-evidence')).toBeVisible();
});

test('status reports fixture indexer and readiness without uptime', async ({ page }) => {
  await page.goto('/status');
  await expect(page.getByText('fixture-indexer')).toBeVisible();
  await expect(page.getByText('fixture-ready')).toBeVisible();
  await expect(page.getByText(/uptime/i)).toHaveCount(1);
});

test('dark theme persists after reload', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Theme', { exact: true }).selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('mobile menu navigates without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.locator('.mobile-nav summary').click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Frozen keys' }).click();
  await expect(page).toHaveURL('/keys');
  await expect(page.locator('.mobile-nav a[aria-current="page"]')).toHaveAttribute('href', '/keys');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

const axeRoutes = ['/', '/network', '/keys', `/keys/${keyId}`, '/preflight', '/incidents', `/incidents/${episodeId}`, '/status', '/developers'];
for (const route of axeRoutes) {
  test(`${route} passes automated axe checks`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, route).toEqual([]);
  });
}
