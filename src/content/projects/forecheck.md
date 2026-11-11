---
title: Forecheck
summary: Weather models scored against real measurements.
order: 3
type: Data Application
screenshots:
  - src: ../../assets/projects/forecheck/cover.webp
    alt: Forecheck showing verdict cards, error by forecast horizon and a model ranking
    caption: Verdict and ranking
links:
  live: https://forecheck.filrok.com
  github: https://github.com/FilipRokita/forecheck
stack: [Python, FastAPI, SQLAlchemy, PostgreSQL, Next.js]
decisions:
  - title: Forecasts are kept as they were issued
    text: Each forecast carries the day it was fetched and its lead time. A forecast refreshed just before its day would make every model look better than it was when anyone could still act on it.
  - title: Truth is a station measurement
    text: Only real station measurements count. Reanalysis data is a model, so it is never used as truth.
  - title: Python owns the calculations
    text: The Python backend owns the data, the database and every calculation. Next.js only displays what the API returns, through types generated from the OpenAPI contract.
  - title: Layers enforced in CI
    text: The domain imports only the standard library, and an import linter fails CI if a layer reaches the wrong way.
  - title: Scores are summable
    text: Each scored day is stored as small sums, so a ranking over any period is one SQL aggregate and raw forecasts are dropped once scored.
---

Forecheck answers one question: at my station, which weather model has been right lately, and for how many days ahead can I rely on it? It checks the forecasts against real measurements in Poland.

Every day it saves what three open models predict for the next seven days at 15 stations, and once a day has been measured it scores each forecast. The page gives a clear verdict, such as which model is the most accurate and for how many days its error stays under a set limit.
