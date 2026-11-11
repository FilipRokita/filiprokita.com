---
title: Tapisode
summary: A fast, phone-first tracker for movies and TV shows.
order: 1
type: Web app
screenshots:
  - src: ../../assets/projects/tapisode/cover.webp
    alt: Tapisode on a desktop and a phone
    caption: Desktop and phone
links:
  live: https://tapisode.filrok.com
  github: https://github.com/FilipRokita/tapisode
stack: [Next.js, TypeScript, PostgreSQL, Drizzle]
decisions:
  - title: Rules independent of the catalog
    text: The rules are pure functions that import nothing outside the domain. The movie catalog sits behind a port, so a fake provider can replace it in tests.
  - title: No lost updates
    text: One function decides every change, and each write checks the state the user saw. Two devices, or a double tap, cannot overwrite each other. Property tests cover it.
  - title: Instant progress
    text: A change is previewed at once with the same rules, then rolled back if saving fails.
  - title: Checked in CI
    text: axe finds no violations on any screen, tap targets are at least 44 px on a phone, and Lighthouse accessibility, best-practices and SEO stay above 0.9.
---

Tapisode keeps track of what you are watching, without social feeds, ratings or noise. One tap on +1 counts the episode, and you can undo it. Home opens on your next episode and lists what airs in the next seven days.

There are three states and nothing else: watching, watchlist, complete. The rules keep the state and the episode in step, so a show that is still airing never counts as complete. See where a title streams in your country and filter your lists by service.

Press Ctrl K to search, and see your episode count, hours and a shareable stats image. A demo session starts with a ready-made list, no account needed, and the app installs on a phone.
