# Architecture Guide

This guide explains the **Clean Architecture** layers and how they interact in this React template.

---

## Core Concepts

### 1. Dependency Rule

**Dependencies point inward**:

- `domain` → (nothing)
- `application` → `domain`
- `infra` → `application`, `domain`
- `adapters` → `application`, `domain` (exports React hooks)
- `ui` → `adapters` (imports hooks), `domain` (types only)

**UI never imports infra directly. UI never imports useContainer directly.**

### 2. Layers

#### Domain (`features/*/domain`)

- **Pure** business logic
- No framework dependencies
- Value objects, entities, domain errors
- Example: `User`, `Session`, `Credentials`

#### Application (`features/*/application`)

- Use cases (orchestration)
- Ports (interfaces for repositories, services)
- Framework-agnostic (no React, no HTTP details)
- Example: `authUseCases.ts`, `AuthRepository` port

#### Infra (`features/*/infra`)

- Implements ports
- HTTP clients, in-memory repos, external APIs
- Resilience patterns (RetryPolicy, CircuitBreaker)
- Example: `inMemoryAuthRepository.ts`, `httpAuthRepository.ts` (with automatic retries)

#### Adapters (`features/*/adapters`)

- Bridges UI and application layer
- TanStack Query queries/mutations factories
- **Exports React hooks** for UI consumption (`useLogin`, `useSession`, `useLogout`)
- Encapsulates DI container access (UI never touches container)
- Example: `authAdapters.ts` exports `useLogin()`, `useLogout()`, `useSession()`

#### UI (`features/*/ui`)

- React components
- Imports **hooks** from `adapters` (e.g., `useLogin`, `useSession`)
- Never imports `useContainer` or accesses DI directly
- Can import from `shared/presentation` (Layout, atoms, molecules)
- Example: `AuthPage.tsx` uses `useLogin()`, `useLogout()`, `useSession()`

---

## Flow Example: Login

```typescript
// 1. UI imports hook from adapters
import { useLogin } from '@features/auth/adapters/authAdapters'

// 2. Component uses hook (no DI container access!)
const { mutate: login } = useLogin()

// 3. User clicks "Login" button
login({ email: '...', password: '...' })
```

**Behind the scenes:**

4. `useLogin()` hook internally calls `useContainer()` to get adapters
5. Mutation invokes `useCases.login()` (Application layer)
6. Use case calls `repository.login()` (Port - interface)
7. Infra implementation executes:
   - **Demo mode**: `inMemoryAuthRepository` (instant mock)
   - **Production mode**: `httpAuthRepository` (with RetryPolicy, 3 attempts, exponential backoff)
8. Result flows back wrapped in `Result<Session, AppError>`
9. Adapter updates TanStack Query cache (`queryClient.setQueryData`)
10. UI re-renders automatically with new session data

---

## Shared Folder

- `shared/domain`: `Result`, `AppError`, `AppErrorFactory`, universal value objects
- `shared/application`: `TelemetryPort`, `LoggerPort` (framework-agnostic interfaces)
- `shared/infra`:
  - `http/`: `HttpClient` (fetch wrapper returning `Result<T, E>`)
  - `resilience/`: `RetryPolicy`, `CircuitBreaker` (fault tolerance patterns)
  - `telemetry/`: `ConsoleTelemetry`, `OpenTelemetryAdapter`
- `shared/presentation`:
  - `components/`: Atomic design (atoms, molecules, organisms)
  - `hooks/`: Reusable UI hooks (useToggle, useDebounce, etc.)
  - `Layout.tsx`: App shell

Shared is **horizontal reuse** across features. No feature-specific logic here.

---

## App Folder

- `app/composition`:
  - `container.ts`: DI container (wires repos → use cases → adapters)
  - `providers.tsx`: React context providers
  - `useAuth.ts`: Convenience hook for auth state (uses `useSession` internally)
- `app/router`:
  - `routes.tsx`: Route definitions
  - `ProtectedRoute.tsx`: Guard component (redirects if not authenticated)
- `app/bootstrap`: Environment config

This is the **composition root** where everything wires together.

**Key principle**: Only adapters access the container. UI imports hooks from adapters.

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
2. **Using `useContainer()` in UI**: UI should import hooks from adapters, not access container
3. **Fat adapters**: keep them thin, logic belongs in use cases
4. **Leaking domain models to UI**: map to view models if needed
5. **Skipping Result**: don't throw in use cases, return `Result.err`
6. **Putting hooks in application/infra**: hooks are React-specific, belong in adapters or presentation only

---

**Next**: [Feature Playbook](feature-playbook.md)
