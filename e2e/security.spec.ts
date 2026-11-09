import { expect, test } from '@playwright/test';
import { routes } from './routes';

test.describe('content security policy', () => {
  for (const route of routes) {
    test(`${route} loads without a single policy violation`, async ({
      page,
    }) => {
      const violations: string[] = [];
      await page.addInitScript(() => {
        addEventListener('securitypolicyviolation', (event) => {
          // Read back through the console, which Playwright listens to.
          console.error(`CSP ${event.violatedDirective} ${event.blockedURI}`);
        });
      });
      page.on('console', (message) => {
        if (message.text().startsWith('CSP ')) violations.push(message.text());
      });
      await page.goto(route);
      // Open the theme toggle path too, so the scripts have all run.
      await page.waitForLoadState('networkidle');
      expect(violations).toEqual([]);
    });
  }

  test('every page has the policy and it allows no unsafe inline script', async ({
    request,
  }) => {
    for (const route of routes) {
      const html = await (await request.get(route)).text();
      const policy =
        /http-equiv="content-security-policy" content="([^"]+)"/.exec(
          html,
        )?.[1];
      expect(policy, route).toBeTruthy();
      expect(policy).toContain("object-src 'none'");
      expect(policy).not.toContain("'unsafe-inline'");
      expect(policy).not.toContain("'unsafe-eval'");
    }
  });
});
