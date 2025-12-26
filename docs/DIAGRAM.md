# Clean Architecture Layers Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          UI LAYER                                │
│  ┌────────────────┐  ┌────────────────┐                        │
│  │  AuthPage.tsx  │  │ProtectedRoute  │  React Components      │
│  └───────┬────────┘  └───────┬────────┘                        │
│          │                    │                                  │
│          ▼                    ▼                                  │
│  ┌────────────────────────────────────┐                         │
│  │  useLogin(), useSession(), etc.    │  Import hooks from      │
│  │  (from adapters, NOT container)    │  adapters directly      │
│  └────────────────┬───────────────────┘                         │
└───────────────────┼──────────────────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────────────────────┐
│                     ADAPTER LAYER                                 │
│  ┌────────────────────────────────────────┐                     │
│  │      authAdapters.ts                   │                     │
│  │  - queries (session)                   │  TanStack Query     │
│  │  - mutations (login, logout)           │  Queries & Mutations│
│  │  - exports: useLogin(), useLogout(),   │                     │
│  │    useSession() hooks                  │  Encapsulates       │
│  │    (internally uses useContainer)      │  DI container       │
│  └───────┬────────────────────────────────┘                     │
│          │                                                        │
│          ▼                                                        │
└──────────┼────────────────────────────────────────────────────────┘
           │
┌──────────▼────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                              │
│  ┌─────────────────────────────────────────┐                    │
│  │ authUseCases                            │  Business Logic    │
│  │ - login(credentials)                    │  Orchestration     │
│  │ - logout()                              │                    │
│  │ - currentSession()                      │                    │
│  └───────┬─────────────────────────────────┘                    │
│          │                                                        │
│          ▼                                                        │
│  ┌─────────────────────────────────────────┐                    │
│  │ AuthRepository (interface/port)         │  Port (Interface)  │
│  └───────┬─────────────────────────────────┘                    │
└──────────┼────────────────────────────────────────────────────────┘
           │
┌──────────▼────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                                  │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐                    │
│  │   User     │  │  Result  │  │ AppError │  Pure Models       │
│  │  Session   │  │          │  │          │  No Dependencies   │
│  │Credentials │  │          │  │          │                    │
│  └────────────┘  └──────────┘  └──────────┘                    │
└───────────────────────────────────────────────────────────────────┘
           ▲
┌──────────┼────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                           │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ inMemoryAuthRepo     │  │ httpAuthRepository   │            │
│  │ (demo/testing)       │  │ (production)         │ Data Layer │
│  │                      │  │ + RetryPolicy        │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  HttpClient  │  │ RetryPolicy  │  │ Telemetry    │ Services│
│  │  (Result<T>) │  │CircuitBreaker│  │ (OpenTelemetry)        │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└───────────────────────────────────────────────────────────────────┘

                              │
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│                       COMPOSITION ROOT                             │
│  ┌────────────────────────────────────────────────┐              │
│  │              container.ts                       │              │
│  │  ┌──────────────────────────────────────────┐  │              │
│  │  │ 1. Create QueryClient                   │  │              │
│  │  │ 2. Create Telemetry                     │  │              │
│  │  │ 3. Create Repository (in-memory/HTTP)   │  │              │
│  │  │ 4. Create UseCases (inject repos)       │  │              │
│  │  │ 5. Create Adapters (inject useCases)    │  │              │
│  │  │ 6. Return Container                     │  │              │
│  │  └──────────────────────────────────────────┘  │              │
│  └────────────────────────────────────────────────┘              │
└───────────────────────────────────────────────────────────────────┘
```

## Dependency Rule

**Dependencies always point INWARD** ⬇️

- ✅ UI → Adapters (hooks) → Application → Domain
- ✅ Infra → Application → Domain
- ❌ Domain NEVER depends on outer layers
- ❌ Application NEVER depends on Infra or UI
- ❌ UI NEVER imports Infra directly
- ❌ UI NEVER imports `useContainer` directly (use adapter hooks)

## Data Flow Example: User Login

```
1. User clicks "Login" in AuthPage.tsx (UI)
                    ↓
2. Component uses useLogin() hook imported from authAdapters
                    ↓
3. Hook internally accesses container and calls loginMutation
                    ↓
4. Mutation invokes useCases.login() (Application)
                    ↓
5. Use case calls repository.login() (Port)
                    ↓
6. Repository implementation (inMemory or HTTP) executes:
   - Demo: inMemoryAuthRepo (instant mock)
   - Production: httpAuthRepository with RetryPolicy (3 attempts)
                    ↓
7. Returns Result<Session, AppError> (Domain)
                    ↓
8. Result flows back through layers
                    ↓
9. Adapter updates TanStack Query cache (setQueryData)
                    ↓
10. AuthPage re-renders with session data (UI)
```

## Shared Layer (Horizontal)

```
┌───────────────────────────────────────────────────────────────┐
│                      SHARED                                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   Domain   │  │Application │  │   Infra    │             │
│  │  Result    │  │ Telemetry  │  │HttpClient  │             │
│  │  AppError  │  │   Logger   │  │            │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│                                                                │
│  ┌────────────────────────────────────────────┐              │
│  │         Presentation                        │              │
│  │  Layout, Hooks, Common UI Utils            │              │
│  └────────────────────────────────────────────┘              │
└───────────────────────────────────────────────────────────────┘
```

Shared code is reused across all features horizontally.

## Feature Isolation

The template demonstrates this with the Auth feature as a complete vertical slice:

```
features/auth/
  ├── domain/              # User, Session, Credentials
  ├── application/         # authUseCases, AuthRepository port
  ├── adapters/            # authAdapters, exports useLogin/useSession/useLogout
  ├── infra/               # inMemoryAuthRepository, httpAuthRepository
  └── ui/                  # AuthPage.tsx
```

**Minimalist approach**: Template includes only Auth as a reference implementation.
Teams add their own features following this pattern.

Features don't import from each other (except through shared).

## Testing Strategy by Layer

```
┌─────────────┬──────────────────┬────────────────────┐
│   Layer     │   Test Type      │   What to Mock     │
├─────────────┼──────────────────┼────────────────────┤
│ Domain      │ Pure unit tests  │ Nothing            │
│ Application │ Unit tests       │ Repositories       │
│ Adapters    │ Integration      │ UseCases           │
│ Infra       │ Unit tests       │ HTTP/Storage       │
│ UI          │ Integration      │ Container (fake)   │
└─────────────┴──────────────────┴────────────────────┘
```

---

**Key Insight**: Clean Architecture is about **dependency inversion**. High-level policies (domain, application) don't depend on low-level details (infra). The flow of control is:

UI → Adapters → Application → Domain ← Infra

But the **source code dependencies** point **inward** only.
