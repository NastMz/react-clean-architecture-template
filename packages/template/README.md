# React Clean Architecture Template

`packages/template` is a React 19 SPA template with a clear feature boundary model.

It includes two complete slices (`auth`, `todo`), app-level extension wiring, and shared primitives you can reuse when adding features.

## What is included

- React 19 + TypeScript + Vite
- Feature slices: `auth` and `todo`
- App integration through `src/app/extensions/<feature>.tsx` + `src/app/extensions/registry.tsx`
- Shared capabilities in `src/shared/{kernel,contracts,network,observability,ui}`
- Zod runtime validation for env and auth-related inputs/responses
- TanStack Query adapters for feature APIs
- Vitest + Testing Library + Playwright setup
- Storybook for shared UI components

## Repo vs package

- Package path: `packages/template`
- Run scripts from repo root with `pnpm -C packages/template <script>`
- Or run scripts directly inside `packages/template` with `pnpm <script>`

## Canonical feature scaffold contract

Before any CLI/generator work happens, this template closes one canonical feature scaffold contract:

- required feature folders: `api`, `adapters`, `application`, `domain`, `infra`, `ui`
- optional folder: `composition`
- UI-facing imports stay on `@features/<feature>/api`
- wiring-facing imports stay on `@features/<feature>/api/composition` only when app composition or tests need them
- app integration happens through `src/app/extensions/<feature>.tsx` plus `src/app/extensions/registry.tsx`

CLI/generator work stays out of scope until this contract is closed in docs, executable seams, examples, and validation.

## Runtime behavior

Auth uses in-memory repository in this template:

- routes: `/auth`, `/todo`
- `/` redirects to the feature marked with `entryRoute.isDefault`
- demo credentials: `demo@example.com` / `demo123`
- session storage key: `demo_session`

## Commands

From `packages/template`:

```bash
pnpm dev
pnpm lint
pnpm format
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm storybook
```

## Documentation map

### User-facing docs

- `QUICKSTART.md` — run and verify the template
- `KNOWN_ISSUES.md` — practical limits that affect consumers
- `docs/architecture.md` — architecture and dependency boundaries
- `docs/feature-playbook.md` — feature scaffold and extension contract
- `docs/environment.md` — env variables and runtime config rules
- `docs/testing-strategy.md` — unit/integration testing approach
- `docs/e2e-testing.md` — Playwright setup and scope
- `docs/opentelemetry.md` — telemetry extension points

### Maintainer-facing docs

- `docs/maintainers/README.md` — template status, internal notes, and follow-up areas
- `docs/decisions/README.md` — ADR convention
