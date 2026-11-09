import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('command palette', () => {
  test.skip(({ isMobile }) => isMobile, 'It is a keyboard feature');

  test('is closed at first and has no button that opens it', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(
      page.getByRole('button', { name: /command|search/i }),
    ).toHaveCount(0);
  });

  test('opens with Ctrl K, filters, and Enter goes to a project', async ({
    page,
  }) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog', { name: 'Command palette' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('combobox')).toBeFocused();

    await page.keyboard.type('forecheck');
    await expect(
      dialog.getByRole('option', { name: /Forecheck/ }),
    ).toBeVisible();
    await expect(dialog.getByRole('option', { name: /Tapisode/ })).toBeHidden();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/projects\/forecheck\/$/);
  });

  test('Escape and Ctrl K both close it, and an empty search says so', async ({
    page,
  }) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    await page.keyboard.type('zzzz');
    await expect(page.getByText('Nothing found')).toBeVisible();
    // No stale option is announced to assistive technology.
    await expect(page.getByRole('combobox')).not.toHaveAttribute(
      'aria-activedescendant',
      /.+/,
    );
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();

    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('can switch the theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.goto('/');
    await page.keyboard.press('Control+k');
    await page.keyboard.type('theme');
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('grows the theme change from the palette entry, not from a toggle', async ({
    page,
  }) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    await page.keyboard.type('theme');
    const box = await page
      .getByRole('option', { name: 'Switch theme' })
      .boundingBox();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', /.+/);
    const origin = await page.evaluate(() => ({
      x: parseFloat(document.documentElement.style.getPropertyValue('--tx')),
      y: parseFloat(document.documentElement.style.getPropertyValue('--ty')),
    }));
    expect(box).not.toBeNull();
    expect(origin.x).toBeCloseTo((box?.x ?? 0) + (box?.width ?? 0) / 2, 0);
    expect(origin.y).toBeCloseTo((box?.y ?? 0) + (box?.height ?? 0) / 2, 0);
  });

  test('has no accessibility violations while open', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog')).toBeVisible();
    const { violations } = await new AxeBuilder({ page })
      .include('[data-palette]')
      .analyze();
    expect(violations).toEqual([]);
  });
});
