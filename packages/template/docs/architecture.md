# Architecture Guide

This document explains the architecture that `packages/template` actually ships today.

The short version: there is one real vertical slice (`auth`), one explicit extensions registry for app wiring, and a small shared foundation. Anything beyond that is a pattern to extend, not a finished platform.

## Current structure

```text
src/
  app/
    bootstrap/      # env parsing and derived runtime config
    composition/    # container, providers, app-level hooks
    router/         # AppRouter and ProtectedRoute
  features/
    auth/
      api/          # public surfaces consumed from outside the feature
      adapters/     # React Query adapter factory
      application/  # use cases and repository port
      composition/  # provider/context hook glue for auth adapters
      domain/       # feature types
      infra/        # in-memory and HTTP repositories
      ui/           # page and UI-facing hooks
  shared/
    contracts/      # shared ports
    kernel/         # Result and AppError
    network/        # HttpClient, RetryPolicy, CircuitBreaker
    observability/  # ConsoleTelemetry and OpenTelemetryAdapter
    ui/             # RootLayout and shared presentational components
```

Important correction: `shared` is capability-based. Any older doc that talks about `shared/domain`, `shared/application`, `shared/infra`, or `shared/presentation` is stale.

## Dependency direction

Inside a feature, dependencies are meant to point inward:

- `domain` -> no feature-layer dependencies
- `application` -> `domain` and shared contracts/kernel only
- `infra` -> implements application ports and can use shared/network
- `adapters` -> depends on application use cases and React Query
- `ui` -> depends on feature-local UI hooks or the feature public API, not on infra/application directly

At app level:

- `src/app/*` can consume a feature only through `@features/*/api` or `@features/*/api/composition`
- `src/shared/*` must stay independent from `@app/*` and `@features/*`

Those rules are enforced in `packages/template/eslint.config.js` for the current `src/features/*` folder convention.

## Public API split

The most important current convention is the split between feature consumption and feature wiring.

### `@features/auth/api`

UI-facing surface consumed by app/router/app-level hooks.

Current exports:

- `AuthPage`
- `useLogin`
- `useLogout`
- `useSession`

### `@features/auth/api/composition`

Wiring surface consumed by the composition root and tests.

Current exports:

- `createAuthAdapters`
- `createAuthUseCases`
- `createInMemoryAuthRepository`
- `createHttpAuthRepository`
- `AuthAdaptersProvider`
- `AuthAdapters`

This matters because the adapter factory does not export React hooks by itself. The hooks live in `packages/template/src/features/auth/ui/authHooks.tsx` and are re-exported through `packages/template/src/features/auth/api/index.ts`.

## App wiring

The app now has an explicit registration center in `packages/template/src/app/extensions/registry.tsx`.

What it wires today:

- `packages/template/src/app/extensions/auth.tsx` defines the auth feature manifest
- the auth manifest selects the repository from runtime config
- the auth manifest creates auth use cases and auth adapters
- `packages/template/src/app/composition/container.ts` still owns shared app services like `QueryClient` and telemetry

Repository selection is currently implemented inside `packages/template/src/app/extensions/auth.tsx`:

- default: `memory`
- when `VITE_USE_HTTP=true`: `http`

The app then mounts providers in `packages/template/src/app/composition/providers.tsx`:

- `ContainerContext.Provider`
- `QueryClientProvider`
- `AuthAdaptersProvider`
- `ReactQueryDevtools`

## Request and auth flow

Current login flow:

1. `AuthPage` uses `useLogin()` from `@features/auth/api`
2. `useLogin()` reads adapters from `useAuthAdapters()`
3. the auth adapter returns a React Query mutation option
4. the mutation calls `authUseCases.login()`
5. the use case calls the selected repository through the `AuthRepository` port
6. on success, the adapter writes the session into the React Query cache

The page never imports a repository and does not touch the container directly.

## Runtime modes

### In-memory mode

Default mode, backed by `packages/template/src/features/auth/infra/inMemoryAuthRepository.ts`.

- demo credentials: `demo@example.com` / `demo123`
- persists session in `localStorage` under `demo_session`
- validates hydrated session payload with Zod

### HTTP mode

Optional mode, backed by `packages/template/src/features/auth/infra/httpAuthRepository.ts`.

- enabled with `VITE_USE_HTTP=true`
- requires `VITE_API_BASE_URL`
- uses `HttpClient`
- uses `RetryPolicy`
- supports token refresh callback wiring from `packages/template/src/app/extensions/auth.tsx`

Important correction: `CircuitBreaker` exists as a shared primitive, but auth HTTP requests are not currently wrapped with it.

## Shared building blocks

What each shared area really does today:

- `@shared/kernel/*` -> `Result` and `AppError`
- `@shared/contracts/*` -> ports such as telemetry/logging contracts
- `@shared/network/*` -> HTTP and resilience primitives
- `@shared/observability/*` -> concrete telemetry implementations
- `@shared/ui/*` -> layout and reusable presentational components

One more honest note: `packages/template/src/shared/ui/hooks/README.md` is a placeholder, not a real hook library yet.

## Router state

The router is intentionally tiny.

- `/` redirects to `/auth`
- `/auth` renders `AuthPage`
- `ProtectedRoute` exists and is integration-tested, but no protected feature route is mounted in `routes.tsx` today

So yes, route protection exists as a pattern. No, the template does not ship a second protected feature proving the whole flow end to end.

## What this architecture is good at

- keeping feature boundaries explicit
- swapping repository implementations without rewriting the page
- testing use cases, repositories, and UI at different seams
- giving teams one concrete reference slice instead of ten fake abstractions

## What it does not prove yet

- multi-feature collaboration
- generalized lint protection for every future feature root
- production-grade auth policy
- template-wide circuit-breaker usage
- mature shared hook/design-system surface

If someone tells you this package already proves all of that, they're overselling it.

## Related docs

- `packages/template/docs/testing-strategy.md`
- `packages/template/docs/environment.md`
- `packages/template/docs/opentelemetry.md`
- `packages/template/docs/feature-playbook.md`
