# React Clean Architecture Template

This package is the current SPA template inside `react-clean-architecture-template`.

It is useful, but it is not a finished framework. Right now it gives you two real vertical slices (`auth` and `todo`), app-level wiring through the extensions registry, boundary linting, and a small shared foundation. Everything else is still on you.

## What is actually in here

- React 19 + TypeScript + Vite
- Two features implemented end to end: `auth`, `todo`
- Manual app wiring split between `src/app/extensions` and `src/app/composition`
- Shared building blocks organized by capability, not by abstract layers
- Runtime validation with Zod in env parsing, forms, HTTP responses, and demo auth inputs
- TanStack Query for feature adapters
- Vitest + Testing Library + Playwright wired and runnable
- Storybook installed, but only used for a small subset of shared atoms today
- ESLint rules that enforce important boundaries, with some gaps called out in `KNOWN_ISSUES.md`

## Repo vs package

This repository also contains work related to Foundry, but this package is the template itself.

- Package path: `packages/template`
- Package scripts can be run either from repo root with `pnpm -C packages/template <script>` or from `packages/template` directly with `pnpm <script>`

## Canonical feature scaffold contract

Before any CLI/generator work happens, this template closes one canonical feature scaffold contract:

- required feature folders: `api`, `adapters`, `application`, `domain`, `infra`, `ui`
- optional folder: `composition`
- UI-facing imports stay on `@features/<feature>/api`
- wiring-facing imports stay on `@features/<feature>/api/composition` only when app composition or tests need them
- app integration happens through `src/app/extensions/<feature>.tsx` plus `src/app/extensions/registry.tsx`

CLI/generator work stays out of scope until this contract is closed in docs, executable seams, examples, and validation.

## Current source layout

```text
packages/template/
  src/
    app/
      bootstrap/        # env parsing and derived config
      composition/      # container, providers, app-level hooks
      router/           # router and ProtectedRoute
    features/
      auth/
        api/            # public API surface
        adapters/       # TanStack Query adapter factory
        application/    # use cases and ports
        composition/    # provider/context used by auth hooks
        domain/         # feature types
        infra/          # memory and HTTP repositories
        ui/             # page and UI-facing hooks
    shared/
      contracts/        # framework-agnostic ports shared across features
      kernel/           # Result and AppError
      network/          # HttpClient, RetryPolicy, CircuitBreaker
      observability/    # ConsoleTelemetry and OpenTelemetryAdapter
      ui/               # RootLayout and shared atoms/molecules
  tests/
    e2e/
    integration/
    unit/
```

The important bit: `shared` is currently organized by capabilities (`kernel`, `network`, `observability`, `ui`, `contracts`). Older docs that talk about `shared/domain`, `shared/application`, or `shared/infra` are outdated.

## App extension contract

App wiring now has one explicit registration seam: `src/app/extensions/<feature>.tsx` plus `src/app/extensions/registry.tsx`.

- each feature exposes its own app-facing extension manifest from `src/app/extensions/<feature>.tsx`
- `src/app/extensions/auth.tsx` owns the auth feature wiring, and `container.ts`, `providers.tsx`, plus `routes.tsx` consume it through the registry
- adding a new feature means registering it once in the registry instead of patching app-level providers, routes, and shell navigation by hand

That keeps the current template simple while giving future tooling a stable file and object shape to extend.

## Public API rule for features

This template now separates feature consumption from feature wiring.

- `@features/<feature>/api`
  - Use this from app/router/app-level hooks and from other features that only need the feature's public UI-facing surface.
  - `auth` currently exports `AuthPage`, `useLogin`, `useLogout`, and `useSession` from here.
- `@features/<feature>/api/composition`
  - Use this only from extension manifests, composition/root wiring, tests, or other app assembly code.
  - `auth` currently exports `createAuthAdapters`, `createAuthUseCases`, `createInMemoryAuthRepository`, `createHttpAuthRepository`, `AuthAdaptersProvider`, and `AuthAdapters` from here.

Concrete example from the current code:

```ts
import { AuthPage, useSession } from '@features/auth/api'
import {
  AuthAdaptersProvider,
  createAuthAdapters,
  createAuthUseCases,
  createInMemoryAuthRepository,
} from '@features/auth/api/composition'
```

Do not import feature internals from `src/app/*`. The ESLint config is explicitly trying to stop that.

## Demo mode that actually exists

Default runtime mode is in-memory auth.

- Routes available: `/auth`, `/todo`
- `/` redirects to the feature marked with `entryRoute.isDefault` in `src/app/extensions/*`
- Demo credentials: `demo@example.com` / `demo123`
- Session persistence: `localStorage` key `demo_session`
- HTTP auth token refresh example stores `access_token` in `sessionStorage`

If you document any other credentials, you are lying.

## Switching auth to HTTP mode

The package supports an HTTP auth repository, but only if you provide a real backend.

Required env:

```env
VITE_USE_HTTP=true
VITE_API_BASE_URL=https://your-api.example.com
```

Current expected endpoints:

- `POST /auth/login` -> `{ user, token }`
- `GET /auth/session` -> `{ user, token } | null`
- `POST /auth/logout` -> empty success response is fine
- `POST /auth/refresh` -> `{ accessToken }` for the refresh callback configured in `src/app/extensions/auth.tsx`

What is NOT included:

- no backend server
- no MSW mock layer
- no generated API client
- no finished refresh-token strategy beyond the current auth extension example
- no circuit breaker wired into the auth HTTP repository yet
- no HTTP repository example for `todo` yet

So yes, HTTP mode exists in code. No, it is not plug-and-play production auth by itself.

## Tooling that is really available

From `packages/template/package.json`:

```bash
pnpm dev
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:write
pnpm typecheck
pnpm test
pnpm test:watch
pnpm test:e2e
pnpm test:e2e:ui
pnpm test:e2e:report
pnpm storybook
pnpm build-storybook
```

Notes:

- `lint` ignores Markdown files, so docs are not architecture-checked by ESLint.
- `format` does check Markdown with Prettier.
- Storybook is installed and runnable, but it is not broad component coverage yet.
- There is CI in `.github/workflows/ci.yml` for typecheck, lint, format, unit/integration tests, Playwright, and build at repo level.

## Testing that is really available

Current test inventory is small but real.

- Unit tests for shared primitives and runtime contracts
  - `tests/unit/shared/Result.test.ts`
  - `tests/unit/shared/network/HttpClient.test.ts`
  - `tests/unit/shared/infra/RetryPolicy.test.ts`
  - `tests/unit/shared/infra/CircuitBreaker.test.ts`
- Unit tests for auth repositories and app bootstrap config/env
- Integration tests for `AuthPage` and `ProtectedRoute`
- Playwright E2E tests for the auth flow in `tests/e2e/auth.spec.ts`

What that does NOT mean:

- no broad feature coverage beyond auth and todo
- no multi-browser matrix in Playwright config
- no hard coverage threshold enforcement
- no exhaustive Storybook interaction tests

## Boundaries the template is trying to enforce

- `src/shared/*` must stay independent from `@app/*` and `@features/*`
- `src/app/*` can consume features only via `@features/*/api` or `@features/*/api/composition`
- feature layer rules exist for `domain`, `application`, `adapters`, and `ui`

That said, not every rule is fully generalized for every future feature yet. Read `KNOWN_ISSUES.md` before pretending this is finished.

## Read these next

- `QUICKSTART.md` - fastest way to run and verify the template
- `KNOWN_ISSUES.md` - current gaps and non-closed areas
- `docs/feature-playbook.md` - how to add a feature without breaking the current boundaries
- `docs/architecture.md` - broader architecture explanation
- `docs/testing-strategy.md` - current testing approach, some parts still need cleanup

## Bottom line

This template is a solid starting point for a client-side React app with one honest example feature.

It is not a full platform, not a code generator, and not a guarantee that every future feature will stay clean unless your team keeps the boundaries tight.
