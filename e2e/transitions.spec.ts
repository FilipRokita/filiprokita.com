import { expect, test } from '@playwright/test';

test.describe('project transitions', () => {
  test('opening a project and going back both use the page transition, and back lands on the row', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Forecheck', exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/forecheck\/$/);
    await expect(page.locator('html')).toHaveAttribute('data-transition', '');

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('html')).toHaveAttribute('data-transition', '');
    // The home page scrolls to the project the visitor came from.
    await expect(
      page.locator('[data-project-image="forecheck"]'),
    ).toBeInViewport();
  });

  test('no animation runs for visitors who prefer reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const name = page.locator('[data-intro="rise"]');
    await expect(name).toHaveCSS('animation-name', 'none');
  });
});
