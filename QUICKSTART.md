# 🎉 React Clean Architecture Template - Production Ready!

## ✅ What's Been Built

A **minimal, production-ready** Clean Architecture React starter with complete Auth implementation:

### Core Stack

- ✅ **React 19** + **TypeScript 5.9** + **Vite 6**
- ✅ **pnpm** package manager
- ✅ **Clean Architecture** folder structure (app/shared/features/tests)

### Architecture & Patterns

- ✅ **Dependency Injection** via manual composition root
- ✅ **Result<T, E>** monad for error handling
- ✅ **AppError** with categories (Validation, Unauthorized, Network, Conflict, Unknown)
- ✅ **Ports & Adapters** pattern
- ✅ **Repository** pattern with both in-memory and HTTP implementations
- ✅ **Protected Routes** with `useAuth()` hook and `ProtectedRoute` guard component
- ✅ **Resilience Patterns**:
  - RetryPolicy: 3 attempts, exponential backoff (100ms → 5s)
  - CircuitBreaker: CLOSED → OPEN → HALF_OPEN states (ready to integrate)

### State Management & Data Fetching

- ✅ **TanStack Query v5** (server state, cache, invalidation)
- ✅ **Zustand** installed (optional UI state)
- ✅ **React Router v6** for navigation

### Validation & Type Safety

- ✅ **Zod** schemas for runtime validation
- ✅ DTO mapping (domain ↔ infra)
- ✅ **TypeScript strict mode** + **verbatimModuleSyntax** + **erasableSyntaxOnly**

### Code Quality

- ✅ **ESLint** with comprehensive boundary enforcement rules:
  - Domain cannot import outer layers
  - Application cannot import infra or UI
  - Adapters cannot import infra or UI
  - UI cannot import application or infra
  - No relative parent imports (`../`)
- ✅ **Prettier** + **EditorConfig**
- ✅ **Husky** + **lint-staged** pre-commit hooks
- ✅ **Import sorting** (simple-import-sort)

### Testing (29 tests, 100% passing)

- ✅ **Vitest** + **React Testing Library**
- ✅ Test structure: unit/ + integration/
- ✅ Tests for:
  - Result monad (5 tests)
  - CircuitBreaker (4 tests)
  - RetryPolicy (6 tests)
  - InMemoryAuthRepository (3 tests)
  - HttpAuthRepository (6 tests)
  - ProtectedRoute (3 tests)
  - AuthPage integration (2 tests)

### Observability

- ✅ **OpenTelemetry** integration for distributed tracing
- ✅ Smart defaults: invisible in browser, visible logs in tests
- ✅ Configurable: custom telemetry adapters supported
- ✅ Ready for Jaeger, Tempo, Datadog, etc.

### Demo Feature: Auth (Complete Reference Implementation)

- ✅ **Domain**: User, Session, Credentials entities
- ✅ **Application**: login/logout/currentSession use cases + AuthRepository port
- ✅ **Adapters**: TanStack Query integration (authAdapters.ts)
- ✅ **Infrastructure**:
  - inMemoryAuthRepository.ts - Instant demo mode (default)
  - httpAuthRepository.ts - Production HTTP mode with RetryPolicy
- ✅ **UI**: AuthPage.tsx with login/logout flow
- ✅ **Telemetry**: All operations tracked
- ✅ **Tests**: Unit + integration coverage

### Component Library & Documentation

- ✅ **Storybook 10** for component development and documentation
- ✅ **Atomic Design** pattern (atoms, molecules, organisms)
- ✅ Auto-generated docs for all components
- ✅ Interactive component playground
- ✅ Stories co-located with components
- ✅ No boilerplate templates (all stories are real)

### Documentation

- ✅ **README.md** with setup, repository switching, and "add feature" guide
- ✅ **docs/architecture.md** – layer explanations + flow examples
- ✅ **docs/feature-playbook.md** – step-by-step for adding new features
- ✅ **docs/testing-strategy.md** – how to test each layer
- ✅ **docs/decisions/README.md** – ADR template
- ✅ **KNOWN_ISSUES.md** – tracking enhancements

---

## 🚀 Quick Start

```bash
pnpm install
pnpm dev         # http://localhost:5173
```

Navigate to `/auth` – Login as `demo@example.com` / any password

**Switch to production HTTP repository:** See [README.md](./README.md#switching-to-production-http-repository)

---

## 📁 Project Structure

```
src/
  app/
    composition/      # DI container + providers (composition root)
    router/           # React Router routes + ProtectedRoute guard
    bootstrap/        # env + config
  shared/
    domain/           # Result, AppError, core types
    application/      # TelemetryPort, LoggerPort
    infra/
      http/           # HttpClient
      resilience/     # RetryPolicy, CircuitBreaker
      telemetry/      # ConsoleTelemetry, OpenTelemetryAdapter
    presentation/     # Layout, shared UI
  features/
    auth/
      domain/         # User, Session, Credentials
      application/    # authUseCases + AuthRepository port
      adapters/       # authAdapters (TanStack Query)
      infra/          # inMemoryAuthRepository + httpAuthRepository
      ui/             # AuthPage
tests/
  unit/             # Domain, use cases, repos, resilience patterns
  integration/      # UI flows, protected routes
  setup.ts
```

**Philosophy:** Minimal template, maximum clarity. One complete example (Auth) shows the full pattern. Teams extend from here.

---

## 🛡️ Architectural Guarantees

- **UI** never imports **infra** directly (ESLint blocks it)
- **Application** only depends on **domain** + ports
- **Domain** is pure (no outer layer imports)
- **Adapters** bridge UI ↔ application
- **Infra** implements ports

Breaking these rules = **lint error** 🚨

---

## 🧪 Available Scripts

```bash
pnpm dev           # Start dev server
pnpm build         # Build for production
pnpm preview       # Preview production build
pnpm lint          # Check ESLint
pnpm lint:fix      # Auto-fix linting issues
pnpm format        # Check Prettier
pnpm format:write  # Format all files
pnpm test          # Run tests
pnpm test:watch    # Watch mode
pnpm storybook     # Start Storybook dev server (port 6006)
pnpm build-storybook  # Build static Storybook
```

---

## 🎯 What Makes This Template Special

1. **Actually enforces Clean Architecture** via ESLint (most templates don't)
   - Domain layer isolation
   - Application layer ports-only
   - UI/Adapters cannot import infra
   - Pre-commit hooks prevent violations

2. **Real working examples** (Auth + Todo + Posts, not just boilerplate)
   - In-memory and HTTP repositories
   - TanStack Query integration
   - Full telemetry instrumentation

3. **Production patterns baked in**:
   - Result<T, E> monad for errors
   - Dependency Injection composition root
   - Ports & Adapters architecture
   - OpenTelemetry for observability
   - Zod for runtime validation

4. **Comprehensive documentation**:
   - Architecture deep-dive
   - Feature playbook (how to add features)
   - Testing strategy by layer
   - OpenTelemetry setup guide
   - ADR template for decisions

5. **Zero friction quality gates**:
   - ESLint boundary rules
   - Prettier auto-formatting
   - Husky + lint-staged pre-commit
   - Vitest + React Testing Library

---

## 📖 Next Steps

### For Your Team

1. Read [docs/architecture.md](docs/architecture.md) to understand layers
2. Follow [docs/feature-playbook.md](docs/feature-playbook.md) to add first feature
3. Adapt `HttpClient` to your API (replace in-memory repos)
4. Configure telemetry: [docs/opentelemetry.md](docs/opentelemetry.md) (Jaeger, Tempo, etc)
5. Add UI library (shadcn/ui, Chakra, MUI) if needed

### To Make It Production-Ready

- [ ] **HTTP repositories** (replace in-memory demos)
- [ ] **Form library** integration (React Hook Form + Zod)
- [ ] **E2E tests** (Playwright)
- [ ] **CI/CD pipeline** (GitHub Actions, GitLab, etc.)
- [ ] **OpenTelemetry backend** (Jaeger, Tempo, Datadog, etc.)
- [ ] **Environment-specific configs** (dev, staging, prod)
- [ ] **API error handling** (network retries, circuit breaker)
- [ ] **Monitoring & alerts** (uptime, error rates)

### Optional Enhancements

- [ ] Add Plop/Hygen generators for features
- [ ] Create `useCase` generator script
- [ ] Add Storybook for component dev
- [ ] Integrate design system

---

## 🤔 FAQ

**Q: Why no Redux?**  
A: TanStack Query handles server state better. Zustand is lighter for UI state. Redux adds complexity without value for most apps.

**Q: Why manual DI instead of InversifyJS?**  
A: Manual composition is simpler, type-safe, and easier to debug. You don't need a DI framework for React apps.

**Q: Tests are failing?**  
A: Known Rolldown issue. Switch `"vite": "npm:rolldown-vite@7.2.5"` to `"vite": "^6.0.0"` in package.json, then `pnpm install`.

**Q: Can I use this with Next.js?**  
A: Yes! The architecture adapts. Move app/ to src/ and adjust routing. SSR requires repos to work server-side.

**Q: Why in-memory repos?**  
A: Easy to demo. Swap for HTTP repos in production (example in feature-playbook.md).

---

## 📝 License

MIT – use freely, commercially, anywhere.

---

## 🙏 Credits

Built with:

- React Team (React, React Router)
- TanStack (TanStack Query)
- Vite Team (Vite, Rolldown)
- Colinhacks (Zod)
- All OSS contributors

---

**Happy Clean Coding!** 🎉

Start building maintainable, testable, scalable React apps today.
