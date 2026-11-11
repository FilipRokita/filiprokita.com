import { expect, test } from '@playwright/test';

// The site itself is the project with several screenshots.
const page = '/projects/this-website/';

test('every screenshot has its own numbered figure and caption', async ({
  page: browser,
}) => {
  await browser.goto(page);
  const figures = browser.locator('#screenshots figure');
  await expect(figures).toHaveCount(3);
  const labels = await figures
    .locator('figcaption span:first-child')
    .allTextContents();
  expect(labels).toEqual(['Fig. 05', 'Fig. 05.2', 'Fig. 05.3']);
});

test('a click opens the screenshot large, Esc closes it and focus returns', async ({
  page: browser,
}, testInfo) => {
  test.skip(testInfo.project.name === 'phone', 'No preview on a phone');
  await browser.emulateMedia({ reducedMotion: 'reduce' });
  await browser.goto(page);
  const opener = browser.locator('#screenshots button.mat').first();
  const dialog = browser.locator('#screenshots dialog').first();
  await opener.scrollIntoViewIfNeeded();
  await opener.click();
  await expect(dialog).toBeVisible();
  await browser.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();

  // The X closes it, and a click on the image does not.
  await opener.click();
  await dialog.locator('img').click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).toBeHidden();
});

test('a click on the backdrop closes the preview', async ({
  page: browser,
}, testInfo) => {
  test.skip(testInfo.project.name === 'phone', 'No preview on a phone');
  await browser.emulateMedia({ reducedMotion: 'reduce' });
  await browser.goto(page);
  const opener = browser.locator('#screenshots button.mat').first();
  const dialog = browser.locator('#screenshots dialog').first();
  await opener.scrollIntoViewIfNeeded();
  await opener.click();
  await expect(dialog).toBeVisible();
  // The corner of the viewport is the backdrop, outside the window.
  await browser.mouse.click(2, 2);
  await expect(dialog).toBeHidden();
});

test('in blueprint mode the click shows the source, not the preview', async ({
  page: browser,
}, testInfo) => {
  test.skip(testInfo.project.name === 'phone', 'No preview on a phone');
  await browser.emulateMedia({ reducedMotion: 'reduce' });
  await browser.goto(page);
  await browser.getByRole('button', { name: 'Blueprint', exact: true }).click();
  await expect(browser.locator('.bp-frame')).toBeVisible();
  const opener = browser.locator('#screenshots button.mat').first();
  await opener.scrollIntoViewIfNeeded();
  await opener.click();
  await expect(browser.locator('.bp-drawer[open]')).toBeVisible();
  await expect(browser.locator('#screenshots dialog').first()).toBeHidden();
});

test('on a phone the screenshots are not buttons', async ({
  page: browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Phone only');
  await browser.goto(page);
  const buttons = browser.locator('#screenshots button.mat');
  await expect(buttons).toHaveCount(3);
  for (const button of await buttons.all()) await expect(button).toBeDisabled();
});
