import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// axe checks text contrast only. Control borders and focus rings are checked from the tokens in
// apps/web/tests/contrast.test.ts, because axe has no rule for non-text contrast.
const routes = ['/', '/network', '/keys', '/preflight', '/impact', '/status'];

for (const theme of ['light', 'dark']) {
  for (const route of routes) {
    test(`${route} has no axe violations in the ${theme} theme`, async ({ page }) => {
      await page.goto(route);
      await page.getByLabel('Theme', { exact: true }).selectOption(theme);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      expect(results.violations, `${theme} ${route}`).toEqual([]);
    });
  }
}
