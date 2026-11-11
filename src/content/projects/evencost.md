---
title: EvenCost
summary: Split costs with friends. Cent-exact splits and a settle-up that clears the whole group.
order: 4
type: Web Application
screenshots:
  - src: ../../assets/projects/evencost/cover.webp
    alt: EvenCost showing a group on a desktop and a phone
    caption: Group view
links:
  live: https://evencost.filrok.com
  github: https://github.com/FilipRokita/evencost
stack: [Next.js, TypeScript, PostgreSQL, Drizzle]
decisions:
  - title: Rules independent of the framework
    text: Splits, balances, netting and permissions are plain TypeScript with no Next.js, React or database imports.
  - title: Money is never a float
    text: Amounts are integer minor units everywhere. The form and the server run the same split function, and the server re-checks the sum before storing.
  - title: Every action authorizes itself
    text: A server action is a public endpoint, so each one checks the session, validates its input and re-checks ownership. Hiding a button is never the boundary.
  - title: Deleting an account keeps the books
    text: The person is anonymized, not removed, so every expense and balance still adds up. Deletes are soft for the same reason, so history stays correct.
  - title: Tests run the real arithmetic
    text: Property tests over random amounts and party sizes, plus an integration test that races two settle-ups against a real Postgres.
---

EvenCost is a small web app for splitting shared costs in a group: a trip, a flat, a project. Everyone adds what they paid, and the balances stay current without a spreadsheet.

Each expense is split equally, by exact amounts or by percentage, and the arithmetic is exact to the cent, so the parts always add up to the total. Deleted expenses stay in the history.

When it is time to close the books, EvenCost suggests an optimized set of transfers that clears the whole group. A settlement is a recorded transfer, so paying back half of what you owe works properly.
