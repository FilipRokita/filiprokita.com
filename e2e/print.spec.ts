import { expect, test } from '@playwright/test';

test.describe('print', () => {
  test.skip(({ isMobile }) => isMobile, 'Printing is a desktop task');

  test('drops the chrome and uses the light colors on paper', async ({
    page,
  }) => {
    await page.emulateMedia({ media: 'print', colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('header')).toBeHidden();
    await expect(page.locator('[data-theme-toggle]').first()).toBeHidden();
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(14, 14, 16)');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
