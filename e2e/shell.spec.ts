import { expect, test } from '@playwright/test';

test.describe('theme', () => {
  test('follows the system setting', async ({ browser }) => {
    for (const [colorScheme, expected] of [
      ['light', 'rgb(244, 243, 239)'],
      ['dark', 'rgb(11, 11, 12)'],
    ] as const) {
      const context = await browser.newContext({ colorScheme });
      const page = await context.newPage();
      await page.goto('/');
      await expect(page.locator('body')).toHaveCSS(
        'background-color',
        expected,
      );
      await context.close();
    }
  });

  test('applies a saved choice before the first paint', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    await context.addInitScript(() => localStorage.setItem('theme', 'light'));
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'commit' });
    // The inline head script runs before the body exists, so there is no flash.
    await page.waitForFunction(
      () => document.documentElement.dataset.theme === 'light',
    );
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toHaveCSS(
      'background-color',
      'rgb(244, 243, 239)',
    );
    await context.close();
  });

  test('the footer toggle switches the theme and remembers it', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const toggle = page.locator('footer [data-theme-toggle]');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveText(/Light/);

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveText(/Dark/);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the page works and the toggle stays hidden', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
    await expect(page.locator('[data-theme-toggle]')).toBeHidden();
  });
});

test.describe('keyboard', () => {
  test('the first Tab stop is a visible skip link that reaches the content', async ({
    page,
  }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('focus is always visible', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => {
      const focused = document.activeElement;
      return focused ? getComputedStyle(focused).outlineStyle : null;
    });
    expect(outline).toBe('solid');
  });
});

test.describe('navigation', () => {
  test('phones show only Contact, larger screens show every section', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link', { name: 'Contact' })).toBeVisible();
    const visible = testInfo.project.name === 'phone' ? 'hidden' : 'visible';
    for (const name of ['About', 'What I do', 'How I work', 'Projects']) {
      const link = nav.getByRole('link', { name });
      if (visible === 'hidden') await expect(link).toBeHidden();
      else await expect(link).toBeVisible();
    }
  });
});
