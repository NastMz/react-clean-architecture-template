# React Clean Architecture Template

This template is an opinionated architecture for React SPAs.

Its goal is to turn React SPA bootstrap into a repeatable operation with consistent architectural standards and less accidental boilerplate.

It is built on React 19 + TypeScript + Vite and focused on clean boundaries between app wiring, feature slices, and shared modules.

It includes runnable examples (`auth` and `todo`) so teams can extend the template with real use cases instead of starting from an empty shell.

## What you get

- React 19 SPA baseline with Vite
- Feature slices for `auth` and `todo`
- App feature integration via `src/app/extensions/*`
- Shared modules under `src/shared/*` (kernel, contracts, network, observability, UI)
- Runtime validation with Zod
- Data orchestration with TanStack Query
- Testing setup: Vitest + Testing Library + Playwright
- Storybook configured for UI exploration

## How to run

```bash
pnpm dev
```

## Common commands

```bash
pnpm lint
pnpm format
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm storybook
```

Run these commands from the project root.

## Current runtime behavior

- Routes available by default: `/auth`, `/todo`
- `/` redirects to the default registered feature route
- Auth uses an in-memory repository for demo purposes
- Demo credentials: `demo@example.com` / `demo123`
- Session key used in storage: `demo_session`

## Documentation

- `QUICKSTART.md` — first run and smoke-check flow
- `KNOWN_ISSUES.md` — current limits and practical caveats
- `docs/architecture.md` — architectural boundaries and module roles
- `docs/feature-playbook.md` — how to add or evolve feature slices
- `docs/environment.md` — env variables and bootstrap config
- `docs/testing-strategy.md` — unit/integration strategy
- `docs/e2e-testing.md` — Playwright setup and scope
- `docs/opentelemetry.md` — telemetry extension points
