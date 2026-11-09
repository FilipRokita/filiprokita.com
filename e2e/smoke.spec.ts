import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Every route of the site. Add new routes here.
const routes = [
  '/',
  '/projects/tapisode/',
  '/projects/evencost/',
  '/projects/forecheck/',
  '/projects/pr-test-agent/',
  '/how-this-site-is-built/',
];

for (const route of routes) {
  test.describe(route, () => {
    test('loads with a title and a heading', async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(/Filip Rokita/);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    for (const colorScheme of ['light', 'dark'] as const) {
      test(`has no accessibility violations in the ${colorScheme} theme`, async ({
        browser,
      }) => {
        const context = await browser.newContext({ colorScheme });
        const page = await context.newPage();
        await page.goto(route);
        const { violations } = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(violations).toEqual([]);
        await context.close();
      });
    }
  });
}
