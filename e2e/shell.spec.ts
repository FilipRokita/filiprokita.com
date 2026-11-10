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

  test('the toggle name follows a change of the system theme', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const toggle = page.locator('header [data-theme-toggle]');
    await expect(toggle).toHaveAccessibleName('Switch to light theme');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(toggle).toHaveAccessibleName('Switch to dark theme');
  });

  test('the theme toggle is a square as tall as the blueprint chip', async ({
    page,
  }) => {
    await page.goto('/');
    const toggle = await page
      .locator('header [data-theme-toggle]')
      .boundingBox();
    const chip = await page
      .locator('header [data-blueprint-chip]')
      .boundingBox();
    expect(toggle?.height).toBeCloseTo(chip?.height ?? 0, 0);
    expect(toggle?.width).toBeCloseTo(toggle?.height ?? 0, 0);
  });

  test('the header toggle switches the theme and remembers it', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const toggle = page.locator('header [data-theme-toggle]');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAccessibleName('Switch to light theme');

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    // The browser bar color follows the chosen theme too.
    for (const meta of await page.locator('meta[name="theme-color"]').all())
      await expect(meta).toHaveAttribute('content', '#f4f3ef');
    await expect(toggle).toHaveAccessibleName('Switch to dark theme');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the page works and the toggle stays hidden', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Email', exact: true }).first(),
    ).toBeVisible();
    for (const toggle of await page.locator('[data-theme-toggle]').all())
      await expect(toggle).toBeHidden();
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
  test('phones have no menu, larger screens show every section', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    if (testInfo.project.name === 'phone') {
      await expect(nav).toBeHidden();
      return;
    }
    for (const name of [
      'About',
      'What I do',
      'How I work',
      'Projects',
      'Contact',
    ]) {
      await expect(nav.getByRole('link', { name, exact: true })).toBeVisible();
    }
  });
});

test.describe('active section', () => {
  test('is marked in a section and cleared again at the top', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      'The dot is for larger screens',
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    const current = nav.locator('[aria-current="true"]');
    await expect(current).toHaveCount(0);

    await page.locator('#what').scrollIntoViewIfNeeded();
    await expect(current).toHaveText('What I do');

    await page.getByRole('link', { name: 'Filip Rokita' }).first().click();
    await expect(current).toHaveCount(0);
  });
});

test.describe('active section dot', () => {
  test('does not move the menu links when it changes', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      'The dot is for larger screens',
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    const positions = () =>
      nav
        .getByRole('link')
        .evaluateAll((links) =>
          links.map((link) => Math.round(link.getBoundingClientRect().left)),
        );
    const before = await positions();
    await page.locator('#what').scrollIntoViewIfNeeded();
    await expect(nav.locator('[aria-current="true"]')).toHaveText('What I do');
    expect(await positions()).toEqual(before);
  });
});

test.describe('links', () => {
  test('links to other sites open in a new tab, the rest do not', async ({
    page,
  }) => {
    await page.goto('/');
    const links = await page.locator('a[href]').evaluateAll((anchors) =>
      anchors.map((a) => ({
        href: a.getAttribute('href') ?? '',
        target: a.getAttribute('target'),
        rel: a.getAttribute('rel') ?? '',
      })),
    );
    const external = links.filter((l) => /^https?:\/\//.test(l.href));
    expect(external.length).toBeGreaterThan(0);
    for (const link of external) {
      expect(link.target, link.href).toBe('_blank');
      expect(link.rel, link.href).toContain('noopener');
    }
    for (const link of links.filter((l) => !/^https?:\/\//.test(l.href))) {
      expect(link.target, link.href).toBeNull();
    }
  });
});
