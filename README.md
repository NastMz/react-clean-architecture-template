# React Clean Architecture Template

A production-ready **Clean Architecture** starter for React applications that enforces **boundaries**, demonstrates **DI composition**, and provides real **Auth** and **Todo** feature examples.

---

## 🎯 What's Inside

- ✅ **React 19 + TypeScript** powered by **Vite**
- ✅ **Clean Architecture** folder structure: `app/`, `shared/`, `features/`, `tests/`
- ✅ **Dependency Injection** via manual composition root
- ✅ **Result + AppError** monad for consistent error handling
- ✅ **TanStack Query** for server state + caching
- ✅ **Zustand** (optional) for UI state
- ✅ **Zod** for runtime validation
- ✅ **React Router** for navigation
- ✅ **Vitest + React Testing Library** for unit/integration tests
- ✅ **ESLint boundary rules** to prevent layer violations
- ✅ **Prettier + EditorConfig** for consistent formatting
- ✅ **Husky + lint-staged** for pre-commit quality gates
- ✅ **Storybook 10** for component documentation and development
- ✅ **Atomic Design** component library with stories
- ✅ **2 demo features**: Auth (login/session) + Todo (list/create/toggle)

---

## 📁 Architecture Overview

```
src/
  app/
    composition/       # DI container & providers
    router/            # Routes setup
    bootstrap/         # env & config
  shared/
    domain/            # Result, AppError, ports
    application/       # TelemetryPort, etc
    infra/             # HttpClient, ConsoleTelemetry
    presentation/      # Layout, hooks
  features/
    auth/
      domain/          # User, Session
      application/     # authUseCases.ts + ports
      adapters/        # authAdapters.ts (TanStack Query)
      infra/           # inMemoryAuthRepository.ts
      ui/              # AuthPage.tsx
    todo/
      domain/          # Todo
      application/     # todoUseCases.ts + ports
      adapters/        # todoAdapters.ts
      infra/           # inMemoryTodoRepository.ts
      ui/              # TodoPage.tsx
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

Open [http://localhost:5173](http://localhost:5173). You'll see:

- **Auth page** (`/auth`): login as `demo@example.com` / `demo123`
- **Todos page** (`/todos`): list, add, and toggle tasks

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
pnpm test          # run all tests
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

1. **Create folder structure** under `src/features/<feature-name>/`:

   ```
   domain/
   application/ports/
   application/<feature>UseCases.ts
   adapters/<feature>Adapters.ts
   infra/<implementation>.ts
   ui/<FeaturePage>.tsx
   ```

2. **Define domain models** in `domain/`
3. **Define repository port** in `application/ports/`
4. **Implement use cases** consuming the port
5. **Implement repository** in `infra/`
6. **Create TanStack Query adapters** in `adapters/`
7. **Wire everything** in `app/composition/container.ts`
8. **Build UI** importing from `adapters` only
9. **Add route** in `app/router/routes.tsx`
10. **Write tests** in `tests/`

See the included **Auth** and **Todo** features as examples.

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
- _(Optional)_ [ADRs](docs/decisions/) – Architectural decision records

---

## 🧩 Future Enhancements

- [ ] **Playwright** setup for E2E tests
- [ ] **Plop/Hygen generators** for scaffolding features
- [ ] **OpenTelemetry** telemetry integration
- [ ] **Sentry** error tracking

---

## 📝 License

MIT

---

## 🤝 Contributing

PRs welcome! Please follow the existing structure and pass all lint/tests before submitting.

---

**Enjoy building Clean Architecture React apps!** 🎉
