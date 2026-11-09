import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('404 page', () => {
  test('is served for an unknown address, with a way back', async ({
    page,
  }) => {
    const response = await page.goto('/no-such-page/');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'home page' })).toBeVisible();
  });

  test('is kept out of search results', async ({ page }) => {
    await page.goto('/no-such-page/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex',
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });

  test('has no accessibility violations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/no-such-page/');
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations).toEqual([]);
  });
});
