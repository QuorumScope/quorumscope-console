import { expect, test, type Page } from '@playwright/test';

const fixture = 'http://127.0.0.1:4010/__fixture/scenario/';

test.afterEach(async ({ request }) => {
  await request.get(`${fixture}default`);
});

async function trackLayoutShift(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver(list => {
      for (const entry of list.getEntries() as unknown as Array<{ value: number; hadRecentInput: boolean }>) {
        if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
}

const shift = (page: Page) => page.evaluate(() => (window as unknown as { __cls: number }).__cls);

test('a slow engine shows a loading state with no result, then the page, without layout shift', async ({ page, request }) => {
  await request.get(`${fixture}slow`);
  await trackLayoutShift(page);
  const navigation = page.goto('/');
  const loading = page.getByRole('status').filter({ hasText: 'Reading engine state' });
  await expect(loading).toBeVisible();
  await expect(loading).toContainText('No result is shown until it arrives.');
  await expect(page.getByText(/No active frozen keys/)).toHaveCount(0);
  await expect(page.getByText(/No active freeze conflict/)).toHaveCount(0);
  await expect(page.getByText('Data freshness')).toHaveCount(0);
  await navigation;
  await expect(page.getByRole('heading', { name: 'Reported state' })).toBeVisible();
  await expect(loading).toHaveCount(0);
  await page.waitForTimeout(300);
  expect(await shift(page)).toBeLessThan(0.02);
});

test('the loading state on the key list also holds no counts or empty message', async ({ page, request }) => {
  await request.get(`${fixture}slow`);
  const navigation = page.goto('/keys');
  await expect(page.getByRole('status').filter({ hasText: 'Reading engine state' })).toBeVisible();
  await expect(page.getByText(/No active frozen keys|No keys were returned/)).toHaveCount(0);
  await navigation;
  await expect(page.getByRole('heading', { level: 1, name: 'Frozen keys' })).toBeVisible();
});

test('client navigation to a slow page shows loading, then the page', async ({ page, request }) => {
  await page.goto('/');
  await request.get(`${fixture}slow`);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Network' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Reading engine state' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Network state' })).toBeVisible();
});
