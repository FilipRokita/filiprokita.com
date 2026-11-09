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
    // The browser bar color follows the chosen theme too.
    for (const meta of await page.locator('meta[name="theme-color"]').all())
      await expect(meta).toHaveAttribute('content', '#f4f3ef');
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
    await expect(
      page.getByRole('link', { name: 'Contact', exact: true }),
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
  test('phones show only Contact, larger screens show every section', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(
      nav.getByRole('link', { name: 'Contact', exact: true }),
    ).toBeVisible();
    const visible = testInfo.project.name === 'phone' ? 'hidden' : 'visible';
    for (const name of ['About', 'What I do', 'How I work', 'Projects']) {
      const link = nav.getByRole('link', { name });
      if (visible === 'hidden') await expect(link).toBeHidden();
      else await expect(link).toBeVisible();
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

test.describe('reading progress', () => {
  test('phones show a line under the header that fills as the page scrolls', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'The line is for phones only');
    await page.goto('/');
    const scale = () =>
      page.evaluate(() => {
        const { transform } = getComputedStyle(
          document.querySelector('header') as Element,
          '::after',
        );
        return transform === 'none'
          ? 1
          : Number(transform.split(',')[0].slice(7));
      });
    expect(await scale()).toBeLessThan(0.1);
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await expect.poll(scale).toBeGreaterThan(0.9);
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
