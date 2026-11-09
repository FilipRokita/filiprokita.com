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

test('touch movement over the hero does not light the column lines', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Phone only');
  await page.goto('/');
  await page.locator('.hero').dispatchEvent('pointermove', {
    pointerType: 'touch',
    clientX: 100,
    clientY: 100,
  });
  await expect(page.locator('.hero')).not.toHaveAttribute('data-lit', '');
});
