# Architecture Guide

This guide explains how this opinionated React SPA architecture template is structured and where extensions should happen.

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

- Runtime contract dependencies stay explicit: React Router and Zod.
- Global state libraries (for example Zustand) remain out of baseline until a dedicated architecture decision assigns one.

## UI ownership thesis

- container orchestrates feature state, hook wiring, mutation callbacks, and error derivation.
- presentational components render structure and visual states from props.
- presentational components must not import hooks, adapters, use cases, or repositories.

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
- `createInMemoryAuthRepository`
- `AuthAdaptersProvider`, `AuthAdapters`

## App wiring

`src/app/extensions/<feature>.tsx` plus `src/app/extensions/registry.tsx` are the single app integration seam.

Each feature registers one manifest, and registry consumers derive providers, routes, navigation, and default route from those manifests.

Feature scaffolding preserves this seam by generating one explicit extension manifest and patching only `registry.tsx` anchors. There is no runtime auto-discovery or DI magic.

## Runtime mode

### In-memory auth

- demo credentials: `demo@example.com` / `demo123`
- session key: `demo_session`

## Related docs

- `docs/feature-playbook.md`
- `docs/environment.md`
- `docs/testing-strategy.md`
- `docs/e2e-testing.md`
- `docs/opentelemetry.md`
