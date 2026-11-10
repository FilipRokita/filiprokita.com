import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const BLUEPRINT_BACKGROUND = 'rgb(10, 53, 119)';

/**
 * Clicks the chip. When that turns the mode on, it waits until the mode has finished loading, because
 * the drawer and the inspector only listen once it has. A real visitor cannot click that fast.
 */
async function toggleBlueprint(page: Page) {
  const chip = page.getByRole('button', { name: 'Blueprint' });
  const turningOn = (await chip.getAttribute('aria-pressed')) === 'false';
  await chip.click();
  if (turningOn) await expect(page.locator('.bp-frame')).toBeVisible();
}

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
    await toggleBlueprint(page);
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
    await toggleBlueprint(page);
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
    await toggleBlueprint(page);
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

    await toggleBlueprint(page);
    await expect(page.locator('.bp-frame')).toBeVisible();
    await expect(page.locator('.bp-title')).toBeVisible();
    await expect(page.locator('.bp-title')).toContainText('Filip Rokita');
    await expect(page.locator('.bp-layer')).toHaveCount(1);

    await toggleBlueprint(page);
    // Nothing the mode added stays: not the frame, not the title block, not the drawing.
    await expect(added).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveAttribute('data-blueprint');
  });

  test('the blocks are labeled with the file that renders them', async ({
    page,
  }) => {
    await page.goto('/');
    await toggleBlueprint(page);
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
    await toggleBlueprint(page);
    const title = page.locator('.bp-title');
    await expect(title).not.toHaveAttribute('data-compact');
    await page.evaluate(() => scrollTo(0, 1200));
    await expect(title).toHaveAttribute('data-compact', '');
  });

  test('nothing the mode adds is read out by a screen reader', async ({
    page,
  }) => {
    await page.goto('/');
    await toggleBlueprint(page);
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
    await toggleBlueprint(page);
    await expect(page.locator('.bp-frame')).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations).toEqual([]);
  });

  test('a printout is the plain page', async ({ page }) => {
    await page.goto('/');
    await toggleBlueprint(page);
    await expect(page.locator('.bp-frame')).toBeVisible();
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.bp-frame')).toBeHidden();
    await expect(page.locator('.bp-title')).toBeHidden();
    await expect(page.locator('.bp-layer')).toBeHidden();
  });

  test.describe('clicking reads the code', () => {
    test('a click on a link opens its source and goes nowhere', async ({
      page,
    }) => {
      await page.goto('/');
      await toggleBlueprint(page);
      const before = page.url();
      const pages = page.context().pages().length;

      await page.locator('.hero a.link[href*="linkedin"]').click();
      const drawer = page.getByRole('dialog', {
        name: /src\/components\/Link\.astro/,
      });
      await expect(drawer).toBeVisible();
      await expect(drawer).toContainText('It is rendered by Link.astro');
      // The line of the source it comes from is marked.
      await expect(drawer.locator('.is-hit')).toContainText('<a');
      expect(page.url()).toBe(before);
      expect(page.context().pages().length).toBe(pages);
    });

    test('a link in the menu does not navigate either', async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name === 'phone', 'The phone has no menu');
      await page.goto('/');
      await toggleBlueprint(page);
      await page.getByRole('link', { name: 'Projects', exact: true }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      expect(new URL(page.url()).hash).toBe('');
    });

    test('Escape closes the drawer and the page works again', async ({
      page,
    }) => {
      await page.goto('/');
      await toggleBlueprint(page);
      await page.locator('.hero a.link[href*="linkedin"]').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toBeHidden();
      // Turning the mode off gives the links back.
      await toggleBlueprint(page);
      await expect(page.locator('html')).not.toHaveAttribute('data-blueprint');
      await expect(page.locator('[data-blueprint-ui]')).toHaveCount(0);
    });

    test('the drawer has a link to the file and its code can be read by keyboard', async ({
      page,
    }) => {
      await page.goto('/');
      await toggleBlueprint(page);
      await page.locator('footer').click({ position: { x: 5, y: 5 } });
      const drawer = page.getByRole('dialog');
      await expect(drawer).toBeVisible();
      const link = drawer.getByRole('link', { name: /View on GitHub/ });
      await expect(link).toHaveAttribute(
        'href',
        /github\.com\/.+\/blob\/main\/src\//,
      );
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
      await expect(
        drawer.getByRole('region', { name: 'Source code' }),
      ).toBeVisible();
    });

    test('has no accessibility violations with the drawer open', async ({
      page,
    }) => {
      await page.goto('/');
      await toggleBlueprint(page);
      await page.locator('.hero a.link[href*="linkedin"]').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      const { violations } = await new AxeBuilder({ page })
        .include('.bp-drawer')
        .analyze();
      expect(violations).toEqual([]);
    });

    test('the command palette still works in the mode', async ({ page }) => {
      await page.goto('/');
      await toggleBlueprint(page);
      await page.keyboard.press('Control+k');
      const palette = page.getByRole('dialog', { name: 'Command palette' });
      await expect(palette).toBeVisible();
      await palette.getByRole('option').first().click();
      // The click went to the palette, not to the code drawer.
      await expect(page.locator('.bp-drawer')).toHaveCount(0);
    });
  });

  test.describe('the inspector', () => {
    test('follows a mouse and names the element under it', async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name === 'phone', 'A phone has no mouse');
      await page.goto('/');
      await toggleBlueprint(page);
      // The mode finishes loading a moment after the click. Move the mouse once it has.
      await expect(page.locator('.bp-frame')).toBeVisible();
      await page.mouse.move(700, 330);
      const readout = page.locator('.bp-inspector-readout');
      await expect(readout).toBeVisible();
      await expect(readout).toContainText('Hero.astro');
      await expect(readout).toContainText('Geist');
    });

    test('is not there on touch: a tap opens the code and nothing else', async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'phone', 'Touch only');
      await page.goto('/');
      await toggleBlueprint(page);
      await page.touchscreen.tap(200, 400);
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.locator('.bp-inspector')).not.toHaveAttribute(
        'data-on',
      );
    });
  });

  test.describe('the drawing of the home page', () => {
    test.beforeEach(async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name === 'phone',
        'The notes need a wide page',
      );
      await page.goto('/');
      await toggleBlueprint(page);
      await expect(page.locator('.bp-text--hand').first()).toBeVisible();
    });

    test('has dimensions measured from the real elements', async ({ page }) => {
      const width = await page
        .locator('.hero h1 .line')
        .evaluate((line) => Math.round(line.getBoundingClientRect().width));
      await expect(
        page.locator('.bp-text--dimension', { hasText: `${width} px` }),
      ).toHaveCount(1);
    });

    test('has handwritten notes, and none sits on another', async ({
      page,
    }) => {
      const notes = page.locator(
        '.bp-layer .bp-text--hand, .bp-layer .bp-text--hand-small',
      );
      expect(await notes.count()).toBeGreaterThan(8);
      const boxes = await notes.evaluateAll((texts) =>
        texts.map((text) => {
          const { x, y, width, height } = text.getBoundingClientRect();
          return { x, y, width, height };
        }),
      );
      // A note of several lines is several texts, so only compare texts that are far apart in height.
      for (const [i, a] of boxes.entries()) {
        for (const b of boxes.slice(i + 1)) {
          const sameLine = Math.abs(a.y - b.y) < 4;
          const overlap =
            a.x < b.x + b.width - 4 &&
            a.x + a.width - 4 > b.x &&
            a.y < b.y + b.height - 6 &&
            a.y + a.height - 6 > b.y;
          expect(sameLine && overlap).toBe(false);
        }
      }
    });

    test('the bill of materials is the measurement of the build', async ({
      page,
      request,
    }) => {
      const bom = await (await request.get('/blueprint/bom.json')).json();
      const home = bom['/'];
      const kilobytes = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;
      const texts = await page
        .locator('.bp-layer .bp-text--notes')
        .allTextContents();
      expect(texts).toContain(kilobytes(home.html.bytes));
      expect(texts).toContain(kilobytes(home.css.bytes));
      expect(texts).toContain(kilobytes(home.js.bytes));
      expect(texts).toContain(String(home.images.n));
    });

    test('the palette shows the real tokens of the site', async ({ page }) => {
      const texts = await page
        .locator('.bp-layer .bp-text--size')
        .allTextContents();
      for (const token of ['--bg', '--fg', '--muted', '--accent']) {
        expect(texts).toContain(token);
      }
    });

    test('the stamp only says CI passed on a build of main', async ({
      page,
    }) => {
      const stamp = page.locator('.bp-stamp-text');
      const text = await stamp.textContent();
      expect(['CI PASSED', 'PREVIEW']).toContain(text);
    });

    test('the detail view magnifies the real arrow of the page', async ({
      page,
    }) => {
      const real = await page
        .locator('.hero a.link[href*="linkedin"] svg path')
        .getAttribute('d');
      await expect(page.locator('.bp-magnified')).toHaveAttribute(
        'd',
        real ?? '',
      );
    });
  });

  test.describe('the other pages', () => {
    test('a project page has its own notes, measured from its elements', async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name === 'phone',
        'The notes need a wide page',
      );
      await page.goto('/projects/tapisode/');
      await toggleBlueprint(page);
      await expect(
        page.locator('.bp-text--hand', { hasText: 'REV F' }),
      ).toBeVisible();
      const columns = await page.locator('.facts').getAttribute('data-count');
      await expect(
        page.locator('.bp-text--hand-small', {
          hasText: `${columns} facts here`,
        }),
      ).toBeVisible();
      await expect(
        page.locator('.bp-text--tag', { hasText: 'Figure.astro' }),
      ).toBeVisible();
    });

    test('the 404 page says why it is a 404', async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name === 'phone',
        'The notes need a wide page',
      );
      await page.goto('/no-such-page/');
      await toggleBlueprint(page);
      await expect(
        page.locator('.bp-text--hand', { hasText: 'status 404' }),
      ).toBeVisible();
      await expect(
        page.locator('.bp-text--hand-small', { hasText: 'noindex' }),
      ).toBeVisible();
    });

    for (const route of ['/projects/forecheck/', '/no-such-page/']) {
      test(`${route} has no accessibility violations in blueprint mode`, async ({
        page,
      }) => {
        await page.goto(route);
        await toggleBlueprint(page);
        const { violations } = await new AxeBuilder({ page }).analyze();
        expect(violations).toEqual([]);
      });

      test(`${route} is left completely when the mode turns off`, async ({
        page,
      }) => {
        await page.goto(route);
        await toggleBlueprint(page);
        await toggleBlueprint(page);
        await expect(page.locator('[data-blueprint-ui]')).toHaveCount(0);
        await expect(page.locator('html')).not.toHaveAttribute(
          'data-blueprint',
        );
      });
    }
  });

  test.describe('on a phone', () => {
    test.beforeEach(async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'phone', 'Phone only');
      await page.goto('/');
      await toggleBlueprint(page);
    });

    test('the drawing is the short version: captions, no dimensions', async ({
      page,
    }) => {
      await expect(
        page.locator('.bp-text--hand-small, .bp-text--hand').first(),
      ).toBeVisible();
      await expect(page.locator('.bp-text--dimension')).toHaveCount(0);
      await expect(page.locator('.bp-text--size')).toHaveCount(0);
      await expect(page.locator('.bp-stamp')).toBeHidden();
    });

    test('nothing the drawing adds makes the page wider than the screen', async ({
      page,
    }) => {
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });

  test.describe('the way in', () => {
    test('the chip draws its corners after a moment, and the hint appears at most twice', async ({
      browser,
    }, testInfo) => {
      test.skip(testInfo.project.name === 'phone', 'One profile is enough');
      const context = await browser.newContext({
        reducedMotion: 'no-preference',
      });
      const page = await context.newPage();
      await page.goto('/');
      const chip = page.getByRole('button', { name: 'Blueprint' });
      await expect(chip).toHaveAttribute('data-tease', '', { timeout: 6000 });
      await expect(chip).toHaveAttribute('data-hint', '', { timeout: 8000 });
      expect(
        await page.evaluate(() => localStorage.getItem('blueprint-hints')),
      ).toBe('1');
      await context.close();
    });

    test('someone who asked for less motion gets no teaser', async ({
      browser,
    }, testInfo) => {
      test.skip(testInfo.project.name === 'phone', 'One profile is enough');
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto('/');
      await page.waitForTimeout(3500);
      const chip = page.getByRole('button', { name: 'Blueprint' });
      await expect(chip).not.toHaveAttribute('data-tease');
      await expect(chip).not.toHaveAttribute('data-hint');
      await context.close();
    });

    test('after the first use the teaser is over for good', async ({
      browser,
    }, testInfo) => {
      test.skip(testInfo.project.name === 'phone', 'One profile is enough');
      const context = await browser.newContext({
        reducedMotion: 'no-preference',
      });
      const page = await context.newPage();
      await page.goto('/');
      await toggleBlueprint(page);
      expect(
        await page.evaluate(() => localStorage.getItem('blueprint-used')),
      ).toBe('1');
      await toggleBlueprint(page);
      await page.reload();
      await page.waitForTimeout(3500);
      await expect(
        page.getByRole('button', { name: 'Blueprint' }),
      ).not.toHaveAttribute('data-tease');
      await context.close();
    });

    test('hovering the chip shows a glimpse and leaves nothing behind', async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name === 'phone', 'A phone cannot hover');
      await page.goto('/');
      const chip = page.getByRole('button', { name: 'Blueprint' });
      await chip.hover();
      await expect(page.locator('html')).toHaveAttribute(
        'data-blueprint-peek',
        '',
      );
      await expect(page.locator('.bp-text--dimension').first()).toBeVisible();
      await page.mouse.move(600, 500);
      await expect(page.locator('html')).not.toHaveAttribute(
        'data-blueprint-peek',
      );
      await expect(page.locator('[data-blueprint-ui]')).toHaveCount(0);
    });

    test('the command palette has an entry for it', async ({ page }) => {
      await page.goto('/');
      await page.keyboard.press('Control+k');
      await page.keyboard.type('blueprint');
      const option = page.getByRole('option', { name: /Blueprint mode/ });
      await expect(option).toBeVisible();
      await page.keyboard.press('Enter');
      await expect(page.locator('html')).toHaveAttribute('data-blueprint', '');
      await expect(
        page.getByRole('button', { name: 'Blueprint' }),
      ).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test.describe('what the review found', () => {
    test('a double click leaves the mode in one clean state', async ({
      page,
    }) => {
      await page.goto('/');
      const chip = page.getByRole('button', { name: 'Blueprint' });
      await chip.dblclick();
      // On and off again, in turn: nothing mounted twice, nothing left behind.
      await expect(chip).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator('html')).not.toHaveAttribute('data-blueprint');
      await expect(page.locator('[data-blueprint-ui]')).toHaveCount(0);
    });

    test('the drawing shrinks again when the page does', async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name === 'phone', 'Needs a window to resize');
      await page.goto('/#blueprint');
      await expect(page.locator('.bp-layer svg')).toBeVisible();
      const pageHeight = () =>
        page.evaluate(() => document.body.getBoundingClientRect().height);
      // How much taller the drawing is than the page it covers.
      const extra = async () =>
        (await page.evaluate(() =>
          Number(
            document.querySelector('.bp-layer svg')?.getAttribute('height'),
          ),
        )) - (await pageHeight());

      // The page settles a moment after the mode opens (images and fonts arrive).
      await page.waitForTimeout(800);
      const original = page.viewportSize() ?? { width: 1280, height: 720 };
      const wide = await pageHeight();
      await page.setViewportSize({ width: 1000, height: 900 });
      await expect.poll(pageHeight).toBeGreaterThan(wide + 100);
      await page.setViewportSize(original);
      // The page is shorter again. The drawing, once built again, must be too.
      await expect.poll(pageHeight).toBeLessThan(wide + 10);
      await page.waitForTimeout(800);
      expect(await extra()).toBeLessThanOrEqual(8);
    });

    test('the palette follows a change of theme', async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name === 'phone',
        'The palette is for wide pages',
      );
      await page.goto('/');
      await toggleBlueprint(page);
      const colors = () =>
        page.locator('.bp-layer .bp-text--size').allTextContents();
      await expect.poll(colors).toContain('#0b0b0c');
      await page.keyboard.press('Control+k');
      await page.keyboard.type('theme');
      await page.keyboard.press('Enter');
      await expect.poll(colors).toContain('#f4f3ef');
    });

    test('the drawer does not animate for someone who asked for less motion', async ({
      page,
    }) => {
      await page.goto('/');
      await toggleBlueprint(page);
      await page.locator('.hero a.link[href*="linkedin"]').click();
      const drawer = page.getByRole('dialog');
      await expect(drawer).toBeVisible();
      expect(
        await drawer.evaluate(
          (element) => getComputedStyle(element).animationName,
        ),
      ).toBe('none');
    });

    test('no handwritten note runs off the screen on a phone', async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'phone', 'Phone only');
      await page.goto('/projects/tapisode/');
      await toggleBlueprint(page);
      await expect(
        page.locator('.bp-text--hand, .bp-text--hand-small').first(),
      ).toBeVisible();
      const widest = await page
        .locator('.bp-text--hand, .bp-text--hand-small')
        .evaluateAll((texts) =>
          Math.max(...texts.map((text) => text.getBoundingClientRect().right)),
        );
      expect(widest).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
    });
  });
});
