# React Clean Architecture Template

A production-ready **Clean Architecture** starter for React applications that enforces **boundaries**, demonstrates **DI composition**, and provides a complete **Auth** feature example with **resilience patterns** (RetryPolicy + CircuitBreaker).

---

## 🎯 What's Inside

- ✅ **React 19 + TypeScript** powered by **Vite**
- ✅ **Clean Architecture** folder structure: `app/`, `shared/`, `features/`, `tests/`
- ✅ **Dependency Injection** via manual composition root
- ✅ **Result + AppError** monad for consistent error handling
- ✅ **TanStack Query** for server state + caching
- ✅ **Zustand** (optional) for UI state
- ✅ **Zod** for runtime validation
- ✅ **React Router** for navigation with protected routes
- ✅ **Vitest + React Testing Library** for unit/integration tests
- ✅ **ESLint boundary rules** to prevent layer violations
- ✅ **Prettier + EditorConfig** for consistent formatting
- ✅ **Husky + lint-staged** for pre-commit quality gates
- ✅ **Storybook 10** for component documentation and development
- ✅ **Atomic Design** component library with stories
- ✅ **OpenTelemetry** integration for distributed tracing
- ✅ **Resilience Patterns**: RetryPolicy (exponential backoff) + CircuitBreaker (fault tolerance)
- ✅ **Production-ready Auth** with both in-memory (demo) and HTTP (production) repositories

---

## 📁 Architecture Overview

```
src/
  app/
    composition/       # DI container & providers
    router/            # Routes + ProtectedRoute guard
    bootstrap/         # env & config
  shared/
    domain/            # Result, AppError, ports
    application/       # TelemetryPort, etc
    infra/
      http/            # HttpClient
      resilience/      # RetryPolicy, CircuitBreaker
      telemetry/       # ConsoleTelemetry, OpenTelemetry
    presentation/      # Layout, hooks
  features/
    auth/
      domain/          # User, Session
      application/     # authUseCases.ts + ports
      adapters/        # authAdapters.ts (TanStack Query)
      infra/           # inMemoryAuthRepository.ts + httpAuthRepository.ts
      ui/              # AuthPage.tsx
tests/
  unit/              # Domain & use case tests
  integration/       # UI integration tests
  setup.ts
```

### Key Principles

1. **UI** imports only from **adapters**, never directly from **infra**
2. **Application** depends on **domain** + ports
3. **Infra** implements ports
4. ESLint **blocks** any forbidden cross-layer imports

---

## 🚀 Getting Started

### Prerequisites

- Node 20+
- pnpm 8+ (`npm install -g pnpm`)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). The template includes:

- **Auth page** (`/auth`): Demo login (credentials: `demo@example.com` / any password)
- **Protected Routes**: Example route guard using `useAuth()` hook
- **In-memory repository**: Instant responses, no backend needed
- **Telemetry console**: See OpenTelemetry events in browser console

### Switching to Production HTTP Repository

Edit `src/app/composition/container.ts`:

```typescript
// 1. Add API_BASE_URL to .env
// VITE_API_BASE_URL=https://your-api.com

// 2. Uncomment these lines in container.ts:
const httpClient = createFetchHttpClient({ baseUrl: import.meta.env.VITE_API_BASE_URL })
const authRepository = createHttpAuthRepository(httpClient, selectedTelemetry, {
  baseUrl: import.meta.env.VITE_API_BASE_URL,
})

// 3. Comment out the in-memory line:
// const authRepository = createInMemoryAuthRepository(selectedTelemetry)
```

**Benefits of HTTP repository:**

- ✅ Automatic retries (3 attempts, exponential backoff)
- ✅ Retries network errors and 5xx status codes
- ✅ Circuit breaker ready (optional, see httpAuthRepository.ts)
- ✅ Telemetry tracking for all operations

### Build

```bash
pnpm build
pnpm preview
```

### Storybook

```bash
pnpm storybook         # start Storybook dev server (port 6006)
pnpm build-storybook   # build static Storybook
```

### Testing

```bash
pnpm test          # run all tests (29 tests across 7 files)
pnpm test:watch    # watch mode
```

### Linting & Formatting

```bash
pnpm lint          # check ESLint rules
pnpm lint:fix      # auto-fix
pnpm format        # check Prettier
pnpm format:write  # format all files
pnpm typecheck     # TypeScript check
```

---

## 📖 How to Add a New Feature

The template is intentionally **minimal** - only Auth example included. Follow these steps to add your own features:

1. **Create folder structure** under `src/features/<feature-name>/`:

   ```
   domain/              # Your entities and value objects
   application/ports/   # Repository interfaces
   application/         # Use cases
   adapters/            # TanStack Query integration
   infra/               # Implementations (in-memory, HTTP, etc.)
   ui/                  # React components
   ```

2. **Define domain models** in `domain/`
3. **Define repository port** in `application/ports/`
4. **Implement use cases** consuming the port
5. **Implement repository** in `infra/` (start with in-memory, add HTTP later)
6. **Create TanStack Query adapters** in `adapters/`
7. **Wire everything** in `app/composition/container.ts`
8. **Build UI** importing from `adapters` only
9. **Add route** in `app/router/routes.tsx`
10. **Write tests** in `tests/`

See the included **Auth** feature as a complete reference implementation.

**Tip:** Use `httpAuthRepository.ts` as a template for adding resilience patterns (retries, circuit breaker) to your HTTP repositories.

---

## 🛡️ ESLint Boundary Rules

We enforce **architectural boundaries** via ESLint:

- **UI** cannot import from `infra`
- **Application** cannot import from `infra` or `ui`
- **Domain** cannot import from outer layers

Breaking these rules will **fail CI** and pre-commit hooks.

---

## 📚 Additional Documentation

- [Architecture Guide](docs/architecture.md) – Deep dive into layers
- [Feature Playbook](docs/feature-playbook.md) – Step-by-step for new features
- [Testing Strategy](docs/testing-strategy.md) – How to test each layer
- [OpenTelemetry Guide](docs/opentelemetry.md) – Distributed tracing setup
- _(Optional)_ [ADRs](docs/decisions/) – Architectural decision records

---

## 📝 License

MIT

---

## 🤝 Contributing

PRs welcome! Please follow the existing structure and pass all lint/tests before submitting.

---

**Enjoy building Clean Architecture React apps!** 🎉
