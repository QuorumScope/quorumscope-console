import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The fixture engine chooses a canned answer from marker text in the posted transaction.
// These tests check how the console presents each engine status, not how the engine classifies.
const keyId = 'a'.repeat(64);

async function analyze(page: Page, marker: string) {
  await page.goto('/preflight');
  await page.getByLabel('Transaction envelope (base64 XDR)').fill(marker);
  await page.getByRole('button', { name: 'Analyze transaction' }).click();
}

const heading = (page: Page, name: string) => page.getByRole('heading', { level: 2, name: new RegExp(name) });

test('clear result with current state', async ({ page }) => {
  await analyze(page, 'fixtureClear');
  await expect(heading(page, 'No active freeze conflict detected')).toBeVisible();
  await expect(page.locator('.result.tone-calm')).toBeVisible();
  await expect(page.getByText('Deterministic', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('No findings.')).toBeVisible();
  await expect(page.getByText('Source ledger').first()).toBeVisible();
});

test('blocked result names the key, the place, and shows no calm styling', async ({ page }) => {
  await analyze(page, 'fixtureBlocked');
  await expect(heading(page, 'Blocked by active freeze')).toBeVisible();
  await expect(page.locator('.result.tone-blocked')).toBeVisible();
  await expect(page.locator('.result.tone-calm')).toHaveCount(0);
  await expect(page.getByText('operation 0 (Payment): destination account').first()).toBeVisible();
  await expect(page.getByText(keyId)).toBeVisible();
});

test('bypassed result explains that a bypass is not an unfreeze and keeps the finding', async ({ page }) => {
  await analyze(page, 'fixtureBypass');
  await expect(heading(page, 'Allowed by active bypass')).toBeVisible();
  await expect(page.getByText('A bypass is not an unfreeze.')).toBeVisible();
  await expect(page.getByText('transaction source account').first()).toBeVisible();
  await expect(page.getByText('Content hash is in the active bypass set').first()).toBeVisible();
});

test('apply-time risk uses cautious wording', async ({ page }) => {
  await analyze(page, 'fixtureApplyTime');
  await expect(heading(page, 'Apply-time freeze check required')).toBeVisible();
  await expect(page.getByText('Conditional', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/detected only when the transaction is applied/).first()).toBeVisible();
});

test('DEX conditional result lists every finding without saying the transaction fails', async ({ page }) => {
  await analyze(page, 'fixtureDex');
  await expect(heading(page, 'DEX behavior depends on matching state')).toBeVisible();
  await expect(page.getByText('operation 0 (ManageSellOffer): offer matching')).toBeVisible();
  await expect(page.getByText('operation 1 (PathPaymentStrictSend): offer matching')).toBeVisible();
  await expect(page.getByText(/does not fail for that reason/)).toBeVisible();
});

test('unsupported analysis says which part was not analyzed', async ({ page }) => {
  await analyze(page, 'fixtureUnsupported');
  await expect(heading(page, 'Analysis not supported for this case')).toBeVisible();
  await expect(page.getByText('operation 0 (EndSponsoringFutureReserves): operation').first()).toBeVisible();
  await expect(page.getByText('Insufficient information', { exact: true }).first()).toBeVisible();
});

test('state unavailable never shows a success treatment', async ({ page }) => {
  await analyze(page, 'fixtureUnavailable');
  await expect(heading(page, 'Current freeze state unavailable')).toBeVisible();
  await expect(page.getByText(/did not return a clear result/).first()).toBeVisible();
  await expect(page.locator('.result.tone-calm')).toHaveCount(0);
  await expect(page.getByText('No active freeze conflict detected')).toHaveCount(0);
});

test('invalid input keeps the pasted text for correction', async ({ page }) => {
  await analyze(page, 'notAFixture');
  await expect(heading(page, 'Invalid transaction input')).toBeVisible();
  await expect(page.getByLabel('Transaction envelope (base64 XDR)')).toHaveValue('notAFixture');
});

test('local validation blocks empty input and links the message to the field', async ({ page }) => {
  await page.goto('/preflight');
  await page.getByRole('button', { name: 'Analyze transaction' }).click();
  const field = page.getByLabel('Transaction envelope (base64 XDR)');
  await expect(page.locator('main').getByRole('alert')).toContainText('Enter a transaction envelope');
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(field).toHaveAttribute('aria-describedby', /xdr-error/);
});

test('an API error shows its request ID and keeps the input', async ({ page }) => {
  await analyze(page, 'fixtureServerError');
  await expect(page.locator('main').getByRole('alert')).toContainText('Storage read failed');
  await expect(page.locator('main').getByRole('alert')).toContainText('00000000-0000-0000-0000-0000000000aa');
  await expect(page.getByLabel('Transaction envelope (base64 XDR)')).toHaveValue('fixtureServerError');
});

test('Ctrl+Enter submits, line breaks are kept, and Clear empties the form', async ({ page }) => {
  await page.goto('/preflight');
  const field = page.getByLabel('Transaction envelope (base64 XDR)');
  await field.fill('fixture\nClear');
  await expect(field).toHaveValue('fixture\nClear');
  await field.press('Control+Enter');
  await expect(heading(page, 'No active freeze conflict detected')).toBeVisible();
  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(field).toHaveValue('');
  await expect(page.locator('.result')).toHaveCount(0);
});

test('the transaction never reaches the URL or browser storage', async ({ page }) => {
  await analyze(page, 'fixtureBlocked');
  await expect(heading(page, 'Blocked by active freeze')).toBeVisible();
  expect(page.url()).not.toContain('fixtureBlocked');
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
  expect(stored).not.toContain('fixtureBlocked');
  expect(await page.evaluate(() => document.cookie)).not.toContain('fixtureBlocked');
});

test('the preflight form and a result pass automated axe checks and work on a small screen', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/preflight');
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.getByLabel('Transaction envelope (base64 XDR)').fill('fixtureBlocked');
  await page.getByRole('button', { name: 'Analyze transaction' }).click();
  await expect(heading(page, 'Blocked by active freeze')).toBeVisible();
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test('a clear result on an unverified protocol is not styled as confirmed', async ({ page, request }) => {
  await request.get('http://127.0.0.1:4010/__fixture/scenario/unverified');
  try {
    await analyze(page, 'fixtureClear');
    await expect(heading(page, 'No active freeze conflict detected')).toBeVisible();
    await expect(page.locator('.result.tone-calm')).toHaveCount(0);
    await expect(page.getByText(/not styled as confirmed/)).toBeVisible();
    await expect(page.getByText(/has not verified compatibility with protocol 29/).first()).toBeVisible();
  } finally {
    await request.get('http://127.0.0.1:4010/__fixture/scenario/default');
  }
});
