import { expect, test } from '@playwright/test';

// Scripted keyboard use. These tests press keys on real controls. They are not a substitute for
// testing with a screen reader or by a person who relies on a keyboard.
const keyId = 'a'.repeat(64);

test('the skip link is the first stop and moves to the main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('navigation links work with Enter and mark the current page', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  await nav.getByRole('link', { name: 'Impact' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/impact');
  await expect(nav.getByRole('link', { name: 'Impact' })).toHaveAttribute('aria-current', 'page');
});

test('the theme control changes theme from the keyboard and keeps its label', async ({ page }) => {
  await page.goto('/');
  const theme = page.getByLabel('Theme', { exact: true });
  await theme.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(theme).toHaveValue('dark');
});

test('frozen key filters can be set and applied without a mouse', async ({ page }) => {
  await page.goto('/keys');
  await page.getByLabel('Key kind').focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Include keys no longer frozen')).toBeFocused();
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Apply filters' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/kind=account/);
  await expect(page).toHaveURL(/history=1/);
});

test('impact filters can be set and applied without a mouse', async ({ page }) => {
  await page.goto('/impact');
  await page.getByLabel('Evidence class').focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/class=direct/);
  await expect(page).toHaveURL(/kind=account/);
});

test('the Freeze Map selects with Enter and Space and exposes its state', async ({ page }) => {
  await page.goto('/impact');
  const node = page.getByRole('button', { name: new RegExp(`ACCOUNT key ${keyId}`) });
  await node.focus();
  await expect(node).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('Space');
  await expect(node).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.map-detail')).toContainText(keyId);
  await page.getByLabel('Evidence class').focus();
  await node.focus();
  await page.keyboard.press('Enter');
  await expect(node).toHaveAttribute('aria-pressed', 'true');
});

test('the preflight form is completed and submitted with the keyboard', async ({ page }) => {
  await page.goto('/preflight');
  const field = page.getByLabel('Transaction envelope (base64 XDR)');
  await field.focus();
  await page.keyboard.type('fixtureBlocked');
  await page.keyboard.press('Control+Enter');
  await expect(page.getByRole('heading', { level: 2, name: /Blocked by active freeze/ })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Analyze transaction' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Clear' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(field).toHaveValue('');
});

test('the mobile menu opens from the keyboard and its links navigate', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const summary = page.locator('.mobile-nav summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  const link = page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Preflight' });
  await expect(link).toBeVisible();
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/preflight');
});

test('every interactive control shows a visible focus indicator', async ({ page }) => {
  await page.goto('/preflight');
  for (const control of [page.getByLabel('Theme', { exact: true }), page.getByLabel('Transaction envelope (base64 XDR)'), page.getByRole('button', { name: 'Analyze transaction' })]) {
    await control.focus();
    const outline = await control.evaluate(el => getComputedStyle(el).outlineStyle + ' ' + getComputedStyle(el).outlineWidth);
    expect(outline, 'focus outline').not.toMatch(/^none/);
    expect(outline).not.toMatch(/ 0px$/);
  }
});
