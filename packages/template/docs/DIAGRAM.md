# Architecture Diagram

```text
App shell
  main.tsx
    -> AppProviders
    -> AppRouter

AppProviders
  -> createContainer()
  -> ContainerContext.Provider
  -> QueryClientProvider
  -> feature providers derived from extension registry
  -> ReactQueryDevtools

AppRouter
  -> /        redirects to /auth
  -> /auth    renders AuthPage
  -> /todo    renders TodoPage behind ProtectedRoute

Outside feature consumption
  -> @features/<feature>/api

Composition and tests
  -> @features/<feature>/api/composition

Auth internals
  ui/authHooks.tsx
    -> composition/useAuthAdapters.ts
    -> adapters/authAdapters.ts

  adapters/authAdapters.ts
    -> application/authUseCases.ts
    -> React Query options and cache updates

  application/authUseCases.ts
    -> application/ports/AuthRepository.ts
    -> shared/contracts/TelemetryPort.ts
    -> shared/kernel/Result.ts

  infra/inMemoryAuthRepository.ts
    -> default runtime mode

  infra/httpAuthRepository.ts
    -> optional runtime mode
    -> shared/network/HttpClient.ts
    -> shared/network/RetryPolicy.ts

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
