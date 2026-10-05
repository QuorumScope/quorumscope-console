import { expect, test } from '@playwright/test';

const keyId = 'a'.repeat(64);

test('impact lists direct and protocol-derived evidence with source and range', async ({ page }) => {
  await page.goto('/impact');
  await expect(page.getByRole('heading', { level: 1, name: 'Impact of the freeze set' })).toBeVisible();
  const table = page.getByRole('table', { name: /Impact records/ });
  await expect(table.locator('.evidence-direct')).toContainText('Direct');
  await expect(table.locator('.evidence-protocol_derived')).toContainText('Protocol-derived');
  await expect(table.getByText('fixture_provider').first()).toBeVisible();
  await expect(table.getByText(/12,340 to 12,345 \(incomplete\)/)).toBeVisible();
  await expect(table.getByRole('link', { name: keyId })).toBeVisible();
});

test('the coverage note says uncollected classes are not collected, not absent', async ({ page }) => {
  await page.goto('/impact');
  await expect(page.getByText(/does not store Recently observed, Dependency observed, Inferred evidence/)).toBeVisible();
  await expect(page.getByText(/means none was collected, not that none exists/)).toBeVisible();
  await expect(page.getByText(/every observation window below is incomplete/)).toBeVisible();
  await expect(page.getByText(/not a claim about which applications depend on a key/)).toBeVisible();
});

test('filtering by an uncollected class says the engine does not collect it', async ({ page }) => {
  await page.goto('/impact');
  await page.getByLabel('Evidence class').selectOption('inferred');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page).toHaveURL(/class=inferred/);
  await expect(page.getByText('Inferred evidence is not collected by the engine.')).toBeVisible();
  await page.goto('/impact?kind=trustline');
  await expect(page.getByText(/No impact records matched/)).toBeVisible();
});

test('the Freeze Map selects a key by keyboard and matches the table', async ({ page }) => {
  await page.goto('/impact');
  const node = page.getByRole('button', { name: new RegExp(`ACCOUNT key ${keyId}`) });
  await expect(node).toBeVisible();
  await node.focus();
  await page.keyboard.press('Enter');
  await expect(node).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.map-detail')).toContainText(keyId);
  await expect(page.locator('.map-detail')).toContainText('No relationships between keys are shown because none are stored');
  await expect(page.getByRole('table', { name: /Impact records/ }).getByRole('link', { name: keyId })).toBeVisible();
});

test('on a narrow screen the map gives way to the table', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/impact');
  await expect(page.locator('.freeze-map')).toBeHidden();
  await expect(page.getByText('The Freeze Map is hidden on narrow screens. Use the table below.')).toBeVisible();
  await expect(page.getByRole('table', { name: /Impact records/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test('an empty freeze set is reported against the source ledger', async ({ page, request }) => {
  await request.get('http://127.0.0.1:4010/__fixture/scenario/empty');
  await page.goto('/impact');
  await expect(page.getByText(/No impact records matched at source ledger 12,345/)).toBeVisible();
  await request.get('http://127.0.0.1:4010/__fixture/scenario/default');
});

test('impact passes automated axe checks', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  await page.goto('/impact');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
