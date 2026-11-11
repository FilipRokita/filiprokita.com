import { expect, test } from '@playwright/test';

test('the whole project row opens the project, not only its title', async ({
  page,
}) => {
  // Reduced motion: no smooth scrolling, so the position is final when it is measured.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const row = page.locator('article.project-row').nth(1);
  await row.scrollIntoViewIfNeeded();
  // The description is not a link by itself, but a click on it opens the project.
  // The overlay of the link sits on top of the text, so click at its position.
  const box = await row.locator('p').first().boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(
    (box?.x ?? 0) + (box?.width ?? 0) / 2,
    (box?.y ?? 0) + (box?.height ?? 0) / 2,
  );
  await expect(page).toHaveURL(/\/projects\/filiprokita-com\/$/);
});

test('each row exposes a single link to assistive technology', async ({
  page,
}) => {
  await page.goto('/');
  const row = page.locator('article.project-row').first();
  await expect(row.getByRole('link')).toHaveCount(1);
});

test('the project title fits on one line on a phone', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Phone only');
  for (const id of [
    'pr-test-agent',
    'tapisode',
    'evencost',
    'forecheck',
    'filiprokita-com',
  ]) {
    await page.goto(`/projects/${id}/`);
    const lines = await page.locator('h1').evaluate((h1) => {
      const line = parseFloat(getComputedStyle(h1).lineHeight);
      return h1.getBoundingClientRect().height / line;
    });
    expect(lines, id).toBeLessThan(1.5);
  }
});
