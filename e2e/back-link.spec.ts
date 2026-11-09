import { expect, test } from '@playwright/test';

test('the back link morphs the image back and lands on the project row', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    'One browser profile is enough',
  );
  await page.goto('/');
  await page.getByRole('link', { name: 'Forecheck', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/forecheck\/$/);

  await page.getByRole('link', { name: 'All projects' }).click();
  await expect(page).toHaveURL(/\/#projects$/);
  await expect(page.locator('html')).toHaveAttribute('data-transition', '');
  const image = page.locator('[data-project-image="forecheck"]');
  await expect(image).toBeInViewport();
  // It stays there: the hash must not scroll the page away afterwards.
  await page.waitForTimeout(800);
  await expect(image).toBeInViewport();
});
