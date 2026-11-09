# 🧪 Testing

What is checked, how to run it and what CI enforces.

## What is checked

| Check | Command | What it catches |
| :--- | :--- | :--- |
| Types | `npm run check` | Type errors in `.astro` and `.ts` files. Part of `npm run build` |
| Lint | `npm run lint` | Code and accessibility problems in templates (ESLint) |
| Format | `npm run format:check` | Files that are not formatted (Prettier) |
| Browser tests | `npm run test:e2e` | A route that does not load, a missing title or heading, any WCAG 2.x A or AA violation found by axe |
| Lighthouse | `npm run lighthouse` | A score below 0.9 in performance, accessibility, best practices or SEO |
| Secret scan | CI only | Secrets in the code or the git history (gitleaks) |

Unit tests (Vitest) arrive with the first logic that needs them, which is the
design tokens and the content helpers.

## Browser tests

The tests live in [`e2e/`](../e2e/) and run against the production build, served by
`astro preview`. Each runs on a desktop and a phone profile (`playwright.config.ts`).

`npm run test:e2e` builds first and then runs the tests. To run them against an
existing build, use `npx playwright test`.

To cover a new route, add it to the `routes` list in `e2e/smoke.spec.ts`.

## Lighthouse

`lighthouserc.cjs` runs Lighthouse three times against the built `dist/` folder and
asserts a minimum score of 0.9 in every category. The threshold is a floor, not the
goal. The goal is 100, and the thresholds are tuned once the real design exists.
Reports are written to `.lighthouseci/`, which git ignores.

## CI

The workflow is [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). It runs on
every pull request and on every push to `main`, as four parallel jobs:

| Job | Runs |
| :--- | :--- |
| Lint, format and build | `npm run lint`, `npm run format:check`, `npm run build` |
| Browser tests | `npx playwright test` on the production build |
| Lighthouse | `npm run lighthouse` |
| Secret scan | gitleaks over the full history |

Actions are pinned to commit SHAs, the workflow token is read-only and a newer run
cancels an older one on the same ref.
