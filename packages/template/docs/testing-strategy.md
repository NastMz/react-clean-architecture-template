# Testing Strategy

This is the testing strategy the template actually supports today.

It is real, but still narrow. The repo proves the pattern through `auth`, `products`, bootstrap config/env, and shared network/kernel utilities.

## Current toolchain

- unit and integration tests run with `vitest`
- DOM testing uses `@testing-library/react` and `@testing-library/user-event`
- browser environment is `jsdom`
- global setup lives in `packages/template/tests/setup.ts`
- E2E runs with Playwright on Chromium only

Relevant config files:

- `packages/template/vite.config.ts`
- `packages/template/playwright.config.ts`
- `packages/template/tsconfig.test.json`

## What exists right now

### Unit tests

- shared kernel: `packages/template/tests/unit/shared/Result.test.ts`
- shared network: `packages/template/tests/unit/shared/network/HttpClient.test.ts`
- resilience primitives: `packages/template/tests/unit/shared/infra/RetryPolicy.test.ts`, `packages/template/tests/unit/shared/infra/CircuitBreaker.test.ts`
- bootstrap env/config: `packages/template/tests/unit/app/bootstrap/env.test.ts`
- auth repositories: `packages/template/tests/unit/features/auth/inMemoryAuthRepository.test.ts`, `packages/template/tests/unit/features/auth/httpAuthRepository.test.ts`
- product repository and use cases: `packages/template/tests/unit/features/products/inMemoryProductRepository.test.ts`, `packages/template/tests/unit/features/products/productUseCases.test.ts`

### Integration tests

- `packages/template/tests/integration/auth/AuthPage.test.tsx`
- `packages/template/tests/integration/products/ProductsPage.test.tsx`
- `packages/template/tests/integration/router/ProtectedRoute.test.tsx`

These tests create a real-ish container shape and mount providers instead of mocking React Query away completely.

### E2E tests

- `packages/template/tests/e2e/auth.spec.ts`

Playwright covers the auth happy path, logout, and invalid-credentials behavior against the running app.

## What does not exist yet

- no coverage thresholds
- no multi-browser Playwright matrix
- no MSW-based API integration layer
- no broad story-driven interaction testing workflow
- no E2E coverage for `products` yet

So don't pretend this is a mature testing platform. It is a good baseline, not a finished testing story.

## Layer-by-layer guidance

### Domain

Use pure unit tests.

- no React
- no DOM
- no network
- no container

Good targets:

- data transformations
- `Result` behavior
- `AppError` mapping rules

### Application

Test use cases by faking the port, not by dragging infra into the test.

For auth, that means:

- fake `AuthRepository`
- fake telemetry contract when you need assertions on tracking
- assert returned `Result` and orchestration behavior

There is not much application-specific coverage today, which is fine to admit. If you add new use cases, this is one of the first gaps to close.

### Infra

Test repository implementations directly.

What auth infra tests already prove:

- in-memory login/logout/current session behavior
- localStorage hydration cleanup for corrupt or invalid session payloads
- HTTP repository URL construction
- HTTP repository success/error handling
- RetryPolicy-backed request flow

Important nuance: the HTTP repository tests use mocked `HttpClient`; they are still unit tests, not real API integration tests.

### Adapters

Adapters return React Query query/mutation options. Test them at that seam when needed.

Focus on:

- query keys
- success cache writes
- logout cache clearing
- mutation/query behavior around `unwrapOrThrow()`

Today the repo gets indirect adapter coverage through integration tests more than through dedicated adapter test files.

### UI and router

Use integration tests with providers.

`AuthPage.test.tsx` is the reference pattern:

- create a `QueryClient`
- create auth repo/use cases/adapters
- wrap with `ContainerContext`, `QueryClientProvider`, and `AuthAdaptersProvider`
- drive the page through accessible selectors

That is the right level for forms and route guards in this template.

## Test helpers and setup

`packages/template/tests/setup.ts` currently does two practical things:

- installs `@testing-library/jest-dom`
- ensures `localStorage` and `sessionStorage` exist in the test runtime

That matters because the in-memory auth repository persists state and the HTTP wiring reads `sessionStorage` for token refresh examples.

## Running the checks

From `packages/template`:

```bash
pnpm test
pnpm test:watch
pnpm test:e2e
pnpm test:e2e:ui
pnpm test:e2e:report
```

From repo root, the equivalent is `pnpm -C packages/template <script>`.

## Coverage reality

Vitest coverage reporters are configured, so `pnpm test -- --coverage` works.

But let's be precise:

- coverage is reportable
- coverage is not enforced by threshold
- a decent-looking percentage would still mostly describe the auth slice and shared utilities

Numbers without scope awareness are bullshit. Read the test inventory, not just the badge someone wishes they had.

## Recommended next additions

If you extend the template, the highest-value testing follow-ups are:

1. add direct application-layer tests for new use cases
2. add adapter-focused tests when cache behavior gets more complex
3. add integration tests for any new route/page immediately
4. expand E2E only after the flow is stable enough to deserve it

## Related docs

- `packages/template/docs/architecture.md`
- `packages/template/docs/e2e-testing.md`
- `packages/template/KNOWN_ISSUES.md`
