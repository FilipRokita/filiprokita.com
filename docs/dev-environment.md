# 🧰 Dev environment

How the development environment is set up.

Everything runs inside a dev container. Open the repo in VS Code and choose
**Dev Containers: Reopen in Container** (or **Rebuild Container** after changing
the configuration).

## The dev container

The definition lives in `.devcontainer/`:

| File | What it does |
| :--- | :--- |
| `devcontainer.json` | Image, features, VS Code extensions and the `postCreateCommand` |
| `setup.sh` | Runs once after the container is created. Installs the project dependencies and the test browser |

### Image and tooling

| Item | Value |
| :--- | :--- |
| Image | `mcr.microsoft.com/devcontainers/typescript-node:5-26-trixie` |
| OS | Debian 13 (trixie) |
| Node | 26 (LTS until April 2029 end of life) |
| Feature | GitHub CLI |
| Extensions | Claude Code, Astro, Tailwind CSS IntelliSense, ESLint, Prettier |

> [!WARNING]
> The Claude Code extension must be version 2.1.314 or newer. Version 2.1.313
> was malicious.

### What `setup.sh` does

1. Runs `npm ci`, which installs exactly what `package-lock.json` locks.
2. Runs `npx playwright install --with-deps chromium`. That one Chromium, with its
   system libraries, serves both the browser tests and Lighthouse CI.

## Node version

Cloudflare builds default to an older Node version, so the project pins Node 26 in
`.nvmrc`. `package.json` also sets `engines.node` to `>=26`.

## Commands

The commands live in `package.json`.

| Command | What it does |
| :--- | :--- |
| `npm run dev` | Starts the dev server on port 4321, reachable from outside the container |
| `npm run build` | Type checks with `astro check`, then builds into `dist/` |
| `npm run preview` | Serves the production build |
| `npm run check` | Type checks the project only |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint over the whole project |
| `npm run format` | Rewrites files with Prettier |
| `npm run format:check` | Fails if a file is not formatted. CI runs this |
| `npm run test:e2e` | Builds, then runs the browser tests. See [Testing](testing.md) |
| `npm run lighthouse` | Builds, then runs Lighthouse CI |

## Editor

The ESLint and Prettier extensions read `eslint.config.js` and `.prettierrc.mjs`.
Prettier does not format Markdown, which is written by hand. The Tailwind plugin
needs `tailwindStylesheet` in `.prettierrc.mjs`, which points at
`src/styles/global.css`.

## Agents

Instructions for coding agents live in [`AGENTS.md`](../AGENTS.md), the shared
standard read by most agents.
