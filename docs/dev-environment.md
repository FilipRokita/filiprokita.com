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
| `setup.sh` | Runs once after the container is created. Installs system packages and project dependencies |

### Image and tooling

| Item | Value |
| :--- | :--- |
| Image | `mcr.microsoft.com/devcontainers/typescript-node:5-26-trixie` |
| OS | Debian 13 (trixie) |
| Node | 26 (LTS until April 2029 end of life) |
| Feature | GitHub CLI |
| Extensions | Claude Code, Astro |

> [!WARNING]
> The Claude Code extension must be version 2.1.314 or newer. Version 2.1.313
> was malicious.

### What `setup.sh` does

1. Installs `chromium` with apt.
2. Runs `npm ci` when a `package.json` exists.

The first install, before a lockfile exists, needs `npm install` instead of
`npm ci`.

## Node version

Cloudflare builds default to an older Node version, so the project pins Node 26 in
a `.nvmrc` file. It is added together with the Astro scaffold.

## Commands

The Astro project is not scaffolded yet. Once it is, the commands live in
`package.json`. Expected scripts:

| Command | What it does |
| :--- | :--- |
| `npm run dev` | Starts the dev server, reachable from outside the container |
| `npm run build` | Production build |
| `npx astro check` | Type checks the project |

## Agents

Instructions for coding agents live in [`AGENTS.md`](../AGENTS.md), the shared
standard read by most agents.
