# E2E Testing with Playwright

This package has real Playwright coverage, but keep your feet on the ground: it is one small Chromium-based suite focused on auth.

## Current configuration

Source of truth: `packages/template/playwright.config.ts`

What it does today:

- test directory: `tests/e2e`
- base URL: `http://localhost:5173`
- project matrix: Chromium only (`Desktop Chrome` device preset)
- reporter: HTML
- screenshots: only on failure
- traces: on first retry
- local web server command: `pnpm dev`
- CI behavior: 2 retries and 1 worker

So yes, E2E exists. No, there is no broad browser matrix yet.

## What the suite covers

`packages/template/tests/e2e/auth.spec.ts` currently checks:

- auth page renders
- login with valid credentials
- logout flow
- invalid credentials error path

The suite exercises the running app, which means it validates the actual providers, router, feature wiring, and default in-memory auth mode together.

## Running it

From `packages/template`:

```bash
pnpm test:e2e
pnpm test:e2e:ui
pnpm test:e2e:report
```

From repo root:

```bash
pnpm -C packages/template test:e2e
```

## Selector style

The current suite mixes semantic selectors and a few raw locators:

- good: `getByRole(...)`
- acceptable here: `input[name="email"]`, `input[type="password"]`

If you expand the suite, prefer accessible selectors first. They tend to survive refactors better and tell you more about whether the UI is actually usable.

## Limitations

- only Chromium is configured
- only auth flow is covered
- no authenticated second route is exercised from the real router
- no HTTP-backend E2E path exists
- no dedicated page-object abstraction yet

That is fine for a starter template. It is not fine if someone tries to market this as exhaustive end-to-end coverage.

## When to add more E2E

Add new Playwright tests when a flow is:

- stable enough to keep
- important enough to guard end to end
- hard to trust with integration tests alone

Do not dump every UI behavior into Playwright just because the tool is installed.
