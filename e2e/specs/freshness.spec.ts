import { expect, test } from '@playwright/test';

const fixture = 'http://127.0.0.1:4010/__fixture/scenario/';
const keyId = 'a'.repeat(64);

test.afterEach(async ({ request }) => {
  await request.get(`${fixture}default`);
});

async function scenario(request: import('@playwright/test').APIRequestContext, name: string) {
  expect((await request.get(`${fixture}${name}`)).ok()).toBe(true);
}

test('fresh no-freeze state says nothing is frozen at the source ledger', async ({ page, request }) => {
  await scenario(request, 'empty');
  await page.goto('/');
  await expect(page.getByText('No active frozen keys')).toBeVisible();
  await expect(page.getByText(/source ledger 12,345/)).toBeVisible();
  await expect(page.locator('.freshness-current').first()).toBeVisible();
});

test('active-freeze state shows counts and links to evidence', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Inspect frozen keys' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'the active freeze episode' })).toBeVisible();
});

test('stale state never confirms that nothing is frozen', async ({ page, request }) => {
  await scenario(request, 'stale');
  await page.goto('/');
  await expect(page.locator('.freshness-stale').first()).toBeVisible();
  await expect(page.getByText(/state below may be out of date/)).toBeVisible();
  await page.goto('/keys');
  await expect(page.locator('.freshness-stale').first()).toBeVisible();
});

test('empty list from stale state is not presented as an empty freeze set', async ({ page, request }) => {
  await scenario(request, 'stale');
  await page.goto('/keys?kind=contract_code');
  await expect(page.getByText(/not a confirmation that nothing is frozen/)).toBeVisible();
});

test('indexing behind shows the lag in ledgers', async ({ page, request }) => {
  await scenario(request, 'behind');
  await page.goto('/network');
  await expect(page.getByText('Indexing behind').first()).toBeVisible();
  await expect(page.getByText('55 ledgers')).toBeVisible();
});

test('an unverified protocol shows a compatibility warning on live pages', async ({ page, request }) => {
  await scenario(request, 'unverified');
  for (const route of ['/', '/network', '/keys', '/preflight', '/status']) {
    await page.goto(route);
    await expect(page.getByText(/has not verified compatibility with protocol 29/).first(), route).toBeVisible();
  }
});

test('an unavailable backend is an outage, not an empty state', async ({ page, request }) => {
  await scenario(request, 'unavailable');
  await page.goto('/');
  await expect(page.getByText('Current state unavailable')).toBeVisible();
  await expect(page.getByText(/No active frozen keys/)).toHaveCount(0);
  await page.goto('/keys');
  await expect(page.getByText('Frozen keys unavailable')).toBeVisible();
  await expect(page.getByText('No active frozen keys')).toHaveCount(0);
});

test('key filters change the list and are kept in the URL', async ({ page }) => {
  await page.goto('/keys');
  await page.getByLabel('Key kind').selectOption('trustline');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page).toHaveURL(/kind=trustline/);
  await expect(page.getByText(/No active frozen keys of kind trustline/)).toBeVisible();
  await page.goto('/keys?history=1');
  await expect(page.getByText('No longer frozen').first()).toBeVisible();
});

test('key detail shows decoded fields, canonical XDR, and history', async ({ page }) => {
  await page.goto(`/keys/${keyId}`);
  await expect(page.getByRole('heading', { name: /Protocol fact/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Observed history' })).toBeVisible();
  await expect(page.getByText('AAAAAAAAAAA=')).toBeVisible();
  await expect(page.getByText('synthetic-account')).toBeVisible();
  await expect(page.getByRole('row', { name: /fixture-history-two/ })).toContainText('Unfrozen');
  await expect(page.getByText(/covers only ledgers the QuorumScope indexer has observed/)).toBeVisible();
});

test('a missing key shows the not found page', async ({ page }) => {
  await page.goto(`/keys/${'9'.repeat(64)}`);
  await expect(page.getByRole('heading', { name: 'No record at this address' })).toBeVisible();
});
