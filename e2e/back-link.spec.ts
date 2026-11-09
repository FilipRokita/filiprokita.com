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

  test('keeps its normal meaning in a new tab, which has no history to go back to', async ({
    page,
    context,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'One profile is enough');
    await page.goto('/');
    const opened = context.waitForEvent('page');
    // A tab opened from the home page: its referrer is the home page, its history is empty.
    await page.evaluate(() => window.open('/projects/forecheck/'));
    const tab = await opened;
    await tab.waitForLoadState();
    await tab.getByRole('link', { name: 'All projects' }).click();
    await expect(tab).toHaveURL(/\/#projects$/);
  });

  test('a click with Ctrl opens a new tab and is not turned into a back', async ({
    page,
    context,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'One profile is enough');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.getByRole('link', { name: 'Forecheck', exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/forecheck\/$/);

    const opened = context.waitForEvent('page');
    await page
      .getByRole('link', { name: 'All projects' })
      .click({ modifiers: ['Control'] });
    const tab = await opened;
    await expect(tab).toHaveURL(/\/#projects$/);
    await expect(page).toHaveURL(/\/projects\/forecheck\/$/);
  });
});
