# Current Architecture Diagram

This is the honest diagram for the template as it exists today.

```text
App shell
  main.tsx
    -> AppProviders
    -> AppRouter

AppProviders
  -> createContainer()
  -> ContainerContext.Provider
  -> QueryClientProvider
  -> AuthAdaptersProvider
  -> ReactQueryDevtools

AppRouter
  -> /        redirects to /auth
  -> /auth    renders AuthPage

AuthPage / app-level consumers
  -> @features/auth/api
     - AuthPage
     - useLogin
     - useLogout
     - useSession

Feature auth internals
  ui/authHooks.tsx
    -> composition/useAuthAdapters.ts
    -> adapters/authAdapters.ts

  adapters/authAdapters.ts
    -> application/authUseCases.ts
    -> React Query query/mutation options
    -> QueryClient cache writes

  application/authUseCases.ts
    -> application/ports/AuthRepository.ts
    -> shared/contracts/TelemetryPort.ts
    -> shared/kernel/Result.ts

  infra/inMemoryAuthRepository.ts
    -> default runtime mode
    -> localStorage demo_session
    -> Zod input/session validation

  infra/httpAuthRepository.ts
    -> optional runtime mode
    -> shared/network/HttpClient.ts
    -> shared/network/RetryPolicy.ts
    -> NOT CircuitBreaker today

Shared foundation
  shared/kernel
  shared/contracts
  shared/network
  shared/observability
  shared/ui
```

## Dependency rule

```text
app -> feature public APIs -> feature internals -> shared
infra -> application/domain/shared
shared -> no app imports, no feature imports
```

More explicitly:

- `src/app/*` should not import feature internals directly
- `src/shared/*` should not import from `@app/*` or `@features/*`
- feature `ui` should not import `application` or `infra` directly
- feature `adapters` should receive infra through composition, not import it directly

## Public API split diagram

```text
Outside feature:
  @features/auth/api
    - UI-facing consumption

  @features/auth/api/composition
    - composition root
    - tests
    - wiring code
```

That split is one of the few strong architectural moves this template already proves. Respect it.

## Runtime mode diagram

```text
getConfig()
  -> authRepositoryType = memory | http

memory
  -> createInMemoryAuthRepository()

http
  -> createFetchHttpClient()
  -> refresh token callback wiring
  -> createHttpAuthRepository()
```

## What this diagram intentionally does not show

Because the code does not prove it yet:

- multiple feature slices
- a protected route mounted in the main router
- circuit breaker active in auth HTTP requests
- exporter-backed telemetry pipeline
- mature shared hook library

If you need those, build them. Don't draw them into existence.
