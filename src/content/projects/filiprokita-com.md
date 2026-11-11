---
title: filiprokita.com
summary: This site. Fast, accessible and tested, with nothing it does not need.
order: 5
type: Website
screenshots:
  - src: ../../assets/projects/filiprokita-com/home.webp
    alt: The home page of filiprokita.com in the light theme
    caption: Home page
  - src: ../../assets/projects/filiprokita-com/blueprint.webp
    alt: Blueprint mode on the home page, the page redrawn as a technical drawing with dimensions and notes
    caption: Blueprint mode
  - src: ../../assets/projects/filiprokita-com/project-page.webp
    alt: A project page in the dark theme, with the title, the facts and the first section
    caption: A project page, dark
links:
  live: https://www.filiprokita.com
  github: https://github.com/FilipRokita/filiprokita.com
stack: [Astro, TypeScript, Tailwind CSS, Playwright, Cloudflare]
decisions:
  - title: Static output, no server
    text: Astro builds HTML, CSS and optimized images at build time, and a CDN serves them. There is no server code and no database.
  - title: Minimum JavaScript
    text: A few small vanilla scripts, and the page works without them. A framework comes in only if a feature truly needs one.
  - title: Projects are data, not pages
    text: Each project is a Markdown file with a validated schema. Adding one is a file and a screenshot, and a mistake fails the build with the file and the field.
  - title: Checked in CI
    text: ESLint, strict types, unit tests, browser tests with axe, Lighthouse budgets and a secret scan run on every change, and a hashed Content Security Policy guards the page.
  - title: Blueprint mode loads on demand
    text: Only a small chip ships to everyone. The drawing, the inspector and the code view load on the first use.
---

This is the site you are on. It is meant to be as good as the code behind it: fast, accessible and tested, with nothing it does not need.

It is built with Astro and strict TypeScript, and every color comes from a design token that works in light and dark. The project pages come from Markdown files, so the site does not go stale as the work changes.

Blueprint mode redraws any page as a technical drawing, with the real dimensions, fonts and tokens measured from the page itself.
