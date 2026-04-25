# E2E Testing with Playwright

Playwright is configured to validate the main auth flow against the running app.

## Current configuration

Source of truth: `playwright.config.ts`

- test directory: `tests/e2e`
- base URL: `http://localhost:5173`
- project matrix: Chromium (`Desktop Chrome`)
- reporter: HTML
- screenshots: on failure
- traces: on first retry
- web server command: `pnpm dev`
- CI defaults: retries enabled, single worker

## What the suite covers

`tests/e2e/auth.spec.ts` currently checks:

- auth page renders
- login with valid credentials
- logout flow
- invalid credentials behavior

## Running E2E

From the project root:

```bash
pnpm test:e2e
pnpm test:e2e:ui
pnpm test:e2e:report
```

## Selector guidance

Prefer accessible selectors such as `getByRole(...)`.

Direct locators (for example `input[name="email"]`) are acceptable when semantic selectors are not practical.

## Related docs

- `docs/testing-strategy.md`
- `KNOWN_ISSUES.md`
