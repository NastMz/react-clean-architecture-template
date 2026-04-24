# Architecture Guide

This guide explains how the template is structured and where extensions should happen.

## Current structure

```text
src/
  app/
    bootstrap/      # env parsing and derived runtime config
    composition/    # container, providers, app-level hooks
    router/         # AppRouter and ProtectedRoute
    extensions/     # feature manifests and registry
  features/
    auth/
      api/
      adapters/
      application/
      composition/
      domain/
      infra/
      ui/
    todo/
      api/
      adapters/
      application/
      composition/
      domain/
      infra/
      ui/
  shared/
    contracts/
    kernel/
    network/
    observability/
    ui/
```

`shared` is organized by capability (`kernel`, `contracts`, `network`, `observability`, `ui`).

## Dependency direction

Inside each feature:

- `domain` -> no feature-layer dependencies
- `application` -> `domain` and shared contracts/kernel
- `infra` -> implements application ports and can use shared/network
- `adapters` -> depends on use cases and TanStack Query
- `ui` -> consumes UI hooks/public API, not infra/application directly

At app level:

- `src/app/*` can consume features through `@features/*/api` or `@features/*/api/composition`
- `src/shared/*` stays independent from `@app/*` and `@features/*`

## Public API split

The template separates UI consumption from composition wiring:

- `@features/<feature>/api` for UI-facing consumption
- `@features/<feature>/api/composition` for composition root and tests

Current auth API exports:

- `AuthPage`, `useLogin`, `useLogout`, `useSession`

Current auth composition exports:

- `createAuthAdapters`, `createAuthUseCases`
- `createInMemoryAuthRepository`, `createHttpAuthRepository`
- `AuthAdaptersProvider`, `AuthAdapters`

## App wiring

`src/app/extensions/<feature>.tsx` plus `src/app/extensions/registry.tsx` are the single app integration seam.

Each feature registers one manifest, and registry consumers derive providers, routes, navigation, and default route from those manifests.

## Runtime modes

### In-memory mode (default)

- demo credentials: `demo@example.com` / `demo123`
- session key: `demo_session`

### HTTP mode (optional)

- enable with `VITE_USE_HTTP=true`
- requires `VITE_API_BASE_URL`
- uses shared `HttpClient` and `RetryPolicy`

## Related docs

- `packages/template/docs/feature-playbook.md`
- `packages/template/docs/environment.md`
- `packages/template/docs/testing-strategy.md`
- `packages/template/docs/e2e-testing.md`
- `packages/template/docs/opentelemetry.md`
