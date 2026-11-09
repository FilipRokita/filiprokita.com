---
title: PR test agent
summary: An AI agent that writes and verifies unit tests for pull requests.
order: 4
cover: ../../assets/projects/pr-test-agent/cover.webp
coverAlt: The flow of the PR test agent, from an opened pull request through the agent and a sandbox to a verified verdict
coverCaption: How it works
links:
  github: https://github.com/FilipRokita/pr-test-agent
stack: [Python, Claude Agent SDK, GitHub Actions]
decisions:
  - title: The model gets no shell
    text: It can read files, write test files only and call one tool that runs tests in a sandbox. There is no shell, no web access and no git, and hooks check every file call against a policy before it runs.
  - title: Jobs are split by what they may do
    text: One job reads, one generates, one verifies and one publishes. The model credential exists only in the step that runs the agent, and the write token only in the job that publishes.
  - title: Proposals are verified, not trusted
    text: A generated test is accepted only if it builds, passes three shuffled runs and covers the changed lines. A guard rejects patterns that weaken the suite, such as skipped tests.
  - title: The agent is measured
    text: Evaluation scenarios with deterministic expectations run several times each, and every bug found by a real run became a failing test first.
---

A pull request changes code. This bot decides whether unit tests are needed, writes or updates them with an agent that uses reusable skills, runs them in a sandbox and shows the result on the pull request.

The agent’s output is trusted no further than it can be checked. Tests arrive as a separate stacked pull request into the original branch, and only after they pass repeated shuffled runs and cover the changed lines.

It runs in GitHub Actions rather than as an app, so there is no live preview, only the repository.
