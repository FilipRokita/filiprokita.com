# 🧪 Testing

What is checked, how to run it and what CI enforces.

## What is checked

| Check | Command | What it catches |
| :--- | :--- | :--- |
| Unit tests | `npm test` | A broken project schema, the project filtering, the contrast helper, and any text and surface pair in the tokens failing WCAG AA |
| Types | `npm run check` | Type errors in `.astro` and `.ts` files. Part of `npm run build` |
| Lint | `npm run lint` | Code and accessibility problems in templates (ESLint) |
| Format | `npm run format:check` | Files that are not formatted (Prettier) |
| Browser tests | `npm run test:e2e` | A route that does not load, a missing title or heading, any WCAG 2.x A or AA violation found by axe |
| Lighthouse | `npm run lighthouse` | A score or metric over its budget (see Lighthouse below) |
| Secret scan | CI only | Secrets in the code or the git history (gitleaks) |

Unit tests (Vitest) cover the pure code in `src/lib/`, the project schema and the design tokens.

## Unit tests

They live in [`tests/`](../tests/) and run with Vitest through Astro's
`getViteConfig()`. `tokens.test.ts` reads the colors from `src/styles/tokens.css` and
checks the contrast of each text pair in both themes.

## Browser tests

The tests live in [`e2e/`](../e2e/) and run against the production build, served by
`astro preview` on its own port (4173), never a dev server. Each runs on a desktop and
a phone profile (`playwright.config.ts`).

`smoke.spec.ts` loads every route and runs axe in both themes. `shell.spec.ts` covers
the shell: the theme follows the system, a saved choice applies before paint, the
toggle works and is remembered, the page works without JavaScript, the skip link and
focus are visible, and the nav matches the screen size.

`npm run test:e2e` builds first and then runs the tests. To run them against an
existing build, use `npx playwright test`.

To cover a new route, add it to the `routes` list in `e2e/routes.ts`. Every route then gets the smoke, axe and
Content Security Policy checks.

## Lighthouse

`lighthouserc.cjs` runs Lighthouse three times against the built `dist/` folder and
asserts these budgets: performance at least 0.95, accessibility, best practices and SEO
at 1, LCP under 2.5 s, CLS under 0.05 and total blocking time under 150 ms. The site
scores 100 today, so a drop is a regression.
Reports are written to `.lighthouseci/`, which git ignores.

## CI

The workflow is [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). It runs on
every pull request and on every push to `main`, as four parallel jobs:

| Job | Runs |
| :--- | :--- |
| Lint, format and build | `npm run lint`, `npm run format:check`, `npm test`, `npm run build` |
| Browser tests | `npx playwright test` on the production build |
| Lighthouse | `npm run lighthouse` |
| Secret scan | gitleaks over the full history |

Actions are pinned to commit SHAs, the workflow token is read-only and a newer run
cancels an older one on the same ref.

## Security headers and the CSP

`security.csp` in `astro.config.mjs` makes Astro add a Content Security Policy `<meta>`
tag with a hash for every script and style it emits. The inline theme script
(`src/scripts/theme-init.js`) is hashed from the same file. `public/_headers` adds the
headers a meta tag cannot (`frame-ancestors`, `nosniff`, referrer and permissions
policies) and long caching for hashed assets. `e2e/security.spec.ts` loads every route
and fails on any policy violation, so a change that needs `unsafe-inline` cannot pass.
