import { expect, test } from '@playwright/test';

test.describe('"All projects" link', () => {
  test('goes back to where the visitor was on the home page', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'One profile is enough');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const row = page.getByRole('link', { name: 'Forecheck', exact: true });
    await row.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => Math.round(scrollY));
    await row.click();
    await expect(page).toHaveURL(/\/projects\/forecheck\/$/);

    await page.getByRole('link', { name: 'All projects' }).click();
    await expect(page).toHaveURL(/:\d+\/$/);
    await expect
      .poll(() => page.evaluate(() => Math.round(scrollY)))
      .toBeGreaterThan(before - 5);
    expect(await page.evaluate(() => Math.round(scrollY))).toBeLessThan(
      before + 5,
    );
  });

  test('is a normal link to the projects when the page is opened directly', async ({
    page,
  }) => {
    await page.goto('/projects/forecheck/');
    await page.getByRole('link', { name: 'All projects' }).click();
    await expect(page).toHaveURL(/\/#projects$/);
  });
});
