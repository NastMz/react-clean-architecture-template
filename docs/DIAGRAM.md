# Clean Architecture Layers Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          UI LAYER                                │
│  ┌────────────────┐  ┌────────────────┐                        │
│  │  AuthPage.tsx  │  │  TodoPage.tsx  │  React Components      │
│  └───────┬────────┘  └───────┬────────┘                        │
│          │                    │                                  │
│          ▼                    ▼                                  │
│  ┌────────────────────────────────────┐                         │
│  │      useContainer() Hook           │  Accesses DI Container  │
│  └────────────────┬───────────────────┘                         │
└───────────────────┼──────────────────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────────────────────┐
│                     ADAPTER LAYER                                 │
│  ┌────────────────┐  ┌────────────────┐                         │
│  │ authAdapters   │  │ todoAdapters   │  TanStack Query         │
│  │ - queries      │  │ - queries      │  Queries & Mutations    │
│  │ - mutations    │  │ - mutations    │                         │
│  └───────┬────────┘  └───────┬────────┘                         │
│          │                    │                                   │
│          ▼                    ▼                                   │
└──────────┼────────────────────┼───────────────────────────────────┘
           │                    │
┌──────────▼────────────────────▼───────────────────────────────────┐
│                    APPLICATION LAYER                              │
│  ┌────────────────┐  ┌────────────────┐                         │
│  │ authUseCases   │  │ todoUseCases   │  Business Logic         │
│  │ - login()      │  │ - listTodos()  │  Orchestration          │
│  │ - logout()     │  │ - createTodo() │                         │
│  │ - session()    │  │ - toggleTodo() │                         │
│  └───────┬────────┘  └───────┬────────┘                         │
│          │                    │                                   │
│          ▼                    ▼                                   │
│  ┌────────────────┐  ┌────────────────┐                         │
│  │ AuthRepository │  │ TodoRepository │  Ports (Interfaces)     │
│  │ (interface)    │  │ (interface)    │                         │
│  └───────┬────────┘  └───────┬────────┘                         │
└──────────┼────────────────────┼───────────────────────────────────┘
           │                    │
┌──────────▼────────────────────▼───────────────────────────────────┐
│                     DOMAIN LAYER                                  │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐                   │
│  │   User     │  │    Todo    │  │  Result  │  Pure Models      │
│  │  Session   │  │            │  │ AppError │  No Dependencies  │
│  │Credentials │  │            │  │          │                   │
│  └────────────┘  └────────────┘  └──────────┘                   │
└───────────────────────────────────────────────────────────────────┘
           ▲                    ▲
┌──────────┼────────────────────┼───────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                           │
│  ┌──────────────────────┐  ┌──────────────────────┐             │
│  │ inMemoryAuthRepo     │  │ inMemoryTodoRepo     │             │
│  │ (implements port)    │  │ (implements port)    │  Data Layer │
│  └──────────────────────┘  └──────────────────────┘             │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  HttpClient  │  │ Telemetry    │  │   Storage    │  Services│
│  │  (fetch)     │  │ (console)    │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
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
│  │  │ 3. Create Repositories                  │  │              │
│  │  │ 4. Create UseCases (inject repos)       │  │              │
│  │  │ 5. Create Adapters (inject useCases)    │  │              │
│  │  │ 6. Return Container                     │  │              │
│  │  └──────────────────────────────────────────┘  │              │
│  └────────────────────────────────────────────────┘              │
└───────────────────────────────────────────────────────────────────┘
```

## Dependency Rule

**Dependencies always point INWARD** ⬇️

- ✅ UI → Adapters → Application → Domain
- ✅ Infra → Application → Domain
- ❌ Domain NEVER depends on outer layers
- ❌ Application NEVER depends on Infra or UI
- ❌ UI NEVER imports Infra directly

## Data Flow Example: User Login

```
1. User clicks "Login" in AuthPage.tsx (UI)
                    ↓
2. AuthPage calls loginMutation.mutate() (Adapter)
                    ↓
3. Adapter invokes useCases.login() (Application)
                    ↓
4. Use case calls repository.login() (Port)
                    ↓
5. inMemoryAuthRepo validates & returns Result<Session> (Infra)
                    ↓
6. Result flows back through layers
                    ↓
7. Adapter updates TanStack Query cache
                    ↓
8. AuthPage re-renders with session data (UI)
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

Each feature is a vertical slice with all layers:

```
features/auth/           features/todo/
  ├── domain/              ├── domain/
  ├── application/         ├── application/
  ├── adapters/            ├── adapters/
  ├── infra/               ├── infra/
  └── ui/                  └── ui/
```

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
