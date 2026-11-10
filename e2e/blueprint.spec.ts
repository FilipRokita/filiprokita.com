import AxeBuilder from '@axe-core/playwright';
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

  test('the sheet and the drawing appear, and off really means off', async ({
    page,
  }) => {
    await page.goto('/');
    const added = page.locator('[data-blueprint-ui]');
    await expect(added).toHaveCount(0);

    await page.getByRole('button', { name: 'Blueprint' }).click();
    await expect(page.locator('.bp-frame')).toBeVisible();
    await expect(page.locator('.bp-title')).toBeVisible();
    await expect(page.locator('.bp-title')).toContainText('Filip Rokita');
    await expect(page.locator('.bp-layer')).toHaveCount(1);

    await page.getByRole('button', { name: 'Blueprint' }).click();
    // Nothing the mode added stays: not the frame, not the title block, not the drawing.
    await expect(added).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveAttribute('data-blueprint');
  });

  test('the blocks are labeled with the file that renders them', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Blueprint' }).click();
    // The header's label is part of the fixed sheet, the others are part of the page.
    const labels = await page.locator('.bp-text--tag').allTextContents();
    for (const name of [
      'Header.astro',
      'Hero.astro',
      'Section.astro',
      'ProjectRow.astro',
      'Figure.astro',
      'Footer.astro',
    ]) {
      expect(labels).toContain(name);
    }
  });

  test('the title block shrinks after the first screen', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Blueprint' }).click();
    const title = page.locator('.bp-title');
    await expect(title).not.toHaveAttribute('data-compact');
    await page.evaluate(() => scrollTo(0, 1200));
    await expect(title).toHaveAttribute('data-compact', '');
  });

  test('nothing the mode adds is read out by a screen reader', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Blueprint' }).click();
    await expect(page.locator('.bp-layer svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(page.locator('.bp-frame')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(page.locator('.bp-title')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  test('has no accessibility violations in blueprint mode', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Blueprint' }).click();
    await expect(page.locator('.bp-frame')).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations).toEqual([]);
  });

  test('a printout is the plain page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Blueprint' }).click();
    await expect(page.locator('.bp-frame')).toBeVisible();
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.bp-frame')).toBeHidden();
    await expect(page.locator('.bp-title')).toBeHidden();
    await expect(page.locator('.bp-layer')).toBeHidden();
  });
});
