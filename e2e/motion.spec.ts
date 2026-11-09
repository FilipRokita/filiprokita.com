import { expect, test } from '@playwright/test';

test.describe('motion', () => {
  test('no animation runs for visitors who prefer reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('[data-intro="rise"]').first()).toHaveCSS(
      'animation-name',
      'none',
    );
  });

  test('the hero name rises in for everyone else', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await expect(page.locator('[data-intro="rise"]').first()).toHaveCSS(
      'animation-name',
      'rise',
    );
  });
});
