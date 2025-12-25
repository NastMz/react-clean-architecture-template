# Architecture Guide

This guide explains the **Clean Architecture** layers and how they interact in this React template.

---

## Core Concepts

### 1. Dependency Rule

**Dependencies point inward**:

- `domain` → (nothing)
- `application` → `domain`
- `infra` → `application`, `domain`
- `adapters` → `application`, `domain`
- `ui` → `adapters`, `domain` (types only)

**UI never imports infra directly.**

### 2. Layers

#### Domain (`features/*/domain`)

- **Pure** business logic
- No framework dependencies
- Value objects, entities, domain errors
- Example: `User`, `Todo`, `Session`

#### Application (`features/*/application`)

- Use cases (orchestration)
- Ports (interfaces for repositories, services)
- Example: `authUseCases.ts`, `TodoRepository` port

#### Infra (`features/*/infra`)

- Implements ports
- HTTP clients, in-memory repos, external APIs
- Example: `inMemoryAuthRepository.ts`, `fetchHttpClient.ts`

#### Adapters (`features/*/adapters`)

- Bridges UI and application layer
- TanStack Query queries/mutations
- Presenters/ViewModels
- Example: `authAdapters.ts`, `todoAdapters.ts`

#### UI (`features/*/ui`)

- React components
- Imports from `adapters` only (+ shared presentation)
- Example: `AuthPage.tsx`, `TodoPage.tsx`

---

## Flow Example: Login

1. User clicks "Login" in `AuthPage.tsx` (UI)
2. UI calls `loginMutation` from `authAdapters.ts` (Adapter)
3. Adapter invokes `useCases.login()` (Application)
4. Use case calls `repository.login()` (Port)
5. Infra implementation (`inMemoryAuthRepository`) executes logic
6. Result flows back up, wrapped in `Result<Session, AppError>`
7. Adapter updates TanStack Query cache
8. UI re-renders with session data

---

## Shared Folder

- `shared/domain`: `Result`, `AppError`, universal value objects
- `shared/application`: `TelemetryPort`, `LoggerPort`
- `shared/infra`: `HttpClient`, `ConsoleTelemetry`
- `shared/presentation`: `Layout`, hooks, common UI utils

Shared is **horizontal reuse** across features.

---

## App Folder

- `app/composition`: DI container & providers
- `app/router`: Route definitions
- `app/bootstrap`: Environment config

This is the **composition root** where everything wires together.

---

## Result & AppError

- `Result<T, E>` is a monad for success/failure
- `AppError` categorizes errors: `Validation`, `Unauthorized`, `Network`, `Conflict`, `Unknown`
- Use cases return `Result<...>` to avoid throwing exceptions
- UI calls `.unwrapOrThrow()` via adapters, TanStack Query handles errors

---

## Testing Strategy

- **Domain**: pure unit tests
- **Application**: test use cases with fake repos
- **Infra**: test repo implementations
- **Adapters**: test query/mutation logic
- **UI**: integration tests with real adapters + mock infra

See [Testing Strategy](testing-strategy.md) for details.

---

## Why This Architecture?

- **Testable**: each layer can be tested in isolation
- **Flexible**: swap infra (in-memory → HTTP → IndexedDB) without touching UI
- **Maintainable**: boundaries prevent spaghetti code
- **Scalable**: add features without breaking existing ones

---

## Common Pitfalls

1. **Importing infra from UI**: blocked by ESLint, but watch for `// eslint-disable`
2. **Fat adapters**: keep them thin, logic belongs in use cases
3. **Leaking domain models to UI**: map to view models if needed
4. **Skipping Result**: don't throw in use cases, return `Result.err`

---

**Next**: [Feature Playbook](feature-playbook.md)
