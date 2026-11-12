import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

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
  await dialog.locator('[data-active] img').click();
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

// Opens the preview on the screenshot with this index. Desktop only: a phone has no preview.
async function openPreview(browser: Page, index: number, path = page) {
  await browser.emulateMedia({ reducedMotion: 'reduce' });
  await browser.goto(path);
  const opener = browser.locator('#screenshots button.mat').nth(index);
  await opener.scrollIntoViewIfNeeded();
  await opener.click();
  const dialog = browser.locator('#screenshots dialog');
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe('the preview as a gallery', () => {
  test.beforeEach(async ({ page: browser }, testInfo) => {
    test.skip(testInfo.project.name === 'phone', 'No preview on a phone');
    await browser.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('opens on the clicked screenshot, with its figure number, caption and a counter', async ({
    page: browser,
  }) => {
    const dialog = await openPreview(browser, 1);
    await expect(dialog.locator('[data-modal-title]')).toHaveText('Fig. 05.2');
    await expect(dialog.locator('[data-modal-caption]')).toHaveText(
      'Blueprint mode',
    );
    await expect(dialog.locator('[data-modal-count]')).toHaveText('2 / 3');
  });

  test('previous and next move between the screenshots and dim at the ends', async ({
    page: browser,
  }) => {
    const dialog = await openPreview(browser, 1);
    const previous = dialog.getByRole('button', { name: 'Previous' });
    const next = dialog.getByRole('button', { name: 'Next' });
    const title = dialog.locator('[data-modal-title]');

    await previous.click();
    await expect(title).toHaveText('Fig. 05');
    await expect(previous).toHaveAttribute('aria-disabled', 'true');
    // At the start, previous does nothing. Playwright will not click an aria-disabled button, so force it.
    await previous.click({ force: true });
    await expect(title).toHaveText('Fig. 05');

    await next.click();
    await next.click();
    await expect(title).toHaveText('Fig. 05.3');
    await expect(next).toHaveAttribute('aria-disabled', 'true');
    await next.click({ force: true });
    await expect(title).toHaveText('Fig. 05.3');
  });

  test('the arrow keys move between the screenshots', async ({
    page: browser,
  }) => {
    const dialog = await openPreview(browser, 0);
    const count = dialog.locator('[data-modal-count]');
    await browser.keyboard.press('ArrowRight');
    await expect(count).toHaveText('2 / 3');
    await browser.keyboard.press('ArrowRight');
    await expect(count).toHaveText('3 / 3');
    await browser.keyboard.press('ArrowLeft');
    await expect(count).toHaveText('2 / 3');
  });

  test('the arrow keys do not move the gallery while the command palette is on top of it', async ({
    page: browser,
  }) => {
    const dialog = await openPreview(browser, 1);
    const count = dialog.locator('[data-modal-count]');
    await browser.keyboard.press('Control+k');
    await expect(browser.locator('dialog[data-palette]')).toBeVisible();
    await browser.keyboard.press('ArrowRight');
    await expect(count).toHaveText('2 / 3');
  });

  test('focus starts on the window, shows no ring on arrow keys, and stays on a clicked button', async ({
    page: browser,
  }) => {
    const dialog = await openPreview(browser, 0);
    await expect(dialog).toBeFocused();
    await browser.keyboard.press('ArrowRight');
    await expect(dialog.locator(':focus-visible')).toHaveCount(0);
    const next = dialog.getByRole('button', { name: 'Next' });
    await next.click();
    await expect(next).toBeFocused();
  });

  test('only the current slide is exposed, and the set is a carousel of numbered slides', async ({
    page: browser,
  }) => {
    const dialog = await openPreview(browser, 1);
    const carousel = dialog.locator('.body');
    await expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');
    const slides = carousel.locator('[data-slide]');
    await expect(slides).toHaveCount(3);
    await expect(slides.nth(1)).toHaveAttribute('aria-label', '2 of 3');
    await expect(slides.nth(1)).toHaveCSS('visibility', 'visible');
    await expect(slides.nth(0)).toHaveCSS('visibility', 'hidden');
  });

  test('a project with one screenshot has no buttons and no counter', async ({
    page: browser,
  }) => {
    const dialog = await openPreview(browser, 0, '/projects/tapisode/');
    await expect(dialog.locator('[data-modal-title]')).toHaveText('Fig. 01');
    await expect(dialog.getByRole('button', { name: 'Previous' })).toBeHidden();
    await expect(dialog.getByRole('button', { name: 'Next' })).toBeHidden();
    await expect(dialog.locator('[data-modal-count]')).toBeHidden();
  });

  for (const scheme of ['light', 'dark'] as const) {
    test(`has no accessibility violations while open, in the ${scheme} theme`, async ({
      page: browser,
    }) => {
      await browser.emulateMedia({ colorScheme: scheme });
      await openPreview(browser, 1);
      const results = await new AxeBuilder({ page: browser })
        .include('dialog[open]')
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
