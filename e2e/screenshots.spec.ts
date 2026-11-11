import { expect, test } from '@playwright/test';

// The site itself is the project with several screenshots.
const page = '/projects/filiprokita-com/';

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
}) => {
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

  // A click on the screenshot itself closes it too.
  await opener.click();
  await expect(dialog).toBeVisible();
  await dialog.locator('img').click();
  await expect(dialog).toBeHidden();
});
