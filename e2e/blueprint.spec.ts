import { expect, test } from '@playwright/test';

const BLUEPRINT_BACKGROUND = 'rgb(10, 53, 119)';

test.describe('blueprint mode', () => {
  test.beforeEach(async ({ page }) => {
    // No animation: the checks are about state, and the circle reveal has its own test below.
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  });

  test('the chip turns the mode on and off', async ({ page }) => {
    await page.goto('/');
    const chip = page.getByRole('button', { name: 'Blueprint' });
    await expect(chip).toBeVisible();
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('html')).not.toHaveAttribute('data-blueprint');
    const normal = await page
      .locator('body')
      .evaluate((body) => getComputedStyle(body).backgroundColor);

    await chip.click();
    await expect(page.locator('html')).toHaveAttribute('data-blueprint', '');
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('body')).toHaveCSS(
      'background-color',
      BLUEPRINT_BACKGROUND,
    );

    await chip.click();
    await expect(page.locator('html')).not.toHaveAttribute('data-blueprint');
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('body')).toHaveCSS('background-color', normal);
  });

  test('the drawing is not part of the page until it is used', async ({
    page,
  }) => {
    await page.goto('/');
    expect(await page.content()).not.toContain('html[data-blueprint]');
    expect(await page.evaluate(() => document.adoptedStyleSheets.length)).toBe(
      0,
    );
    await page.getByRole('button', { name: 'Blueprint' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-blueprint', '');
    expect(
      await page.evaluate(() => document.adoptedStyleSheets.length),
    ).toBeGreaterThan(0);
  });

  test('a /#blueprint link opens the page in the mode, and leaving clears the link', async ({
    page,
  }) => {
    await page.goto('/#blueprint');
    await expect(page.locator('html')).toHaveAttribute('data-blueprint', '');
    await page.getByRole('button', { name: 'Blueprint' }).click();
    await expect(page.locator('html')).not.toHaveAttribute('data-blueprint');
    expect(new URL(page.url()).hash).toBe('');
  });

  test('the circle reveal ends and leaves nothing behind', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.getByRole('button', { name: 'Blueprint' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-blueprint', '');
    await expect(page.locator('html')).not.toHaveClass(/theme-vt/);
    await context.close();
  });
});
