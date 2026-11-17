# Feature-Sliced React App

A production-ready React SPA starter organized with [Feature-Sliced Design](https://feature-sliced.design) (FSD v2.1), with the architecture rules enforced by a linter instead of left to convention.

## Quick path

```bash
pnpm install
pnpm dev          # http://localhost:5173 — sign in with demo@example.com / demo123
pnpm check        # typecheck, ESLint, Steiger (FSD), Prettier and tests
```

There is no backend to start: in development a [Mock Service Worker](https://mswjs.io) backend serves `/api`. Point the app at your own API with two env variables, see [docs/environment.md](docs/environment.md).

## Stack

| Concern           | Choice                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Build             | Vite 8, React 19 with the React Compiler, TypeScript (strict)                                |
| Architecture      | Feature-Sliced Design v2.1, enforced by [Steiger](https://github.com/feature-sliced/steiger) |
| Routing           | React Router 8 (data mode): lazy pages, loaders, auth middleware                             |
| Server state      | TanStack Query with query-option factories                                                   |
| Forms, validation | React Hook Form + Zod (forms, API responses and env)                                         |
| API mocking       | MSW, shared by the dev server and the tests                                                  |
| Tests             | Vitest + Testing Library + MSW, Playwright for end-to-end                                    |
| UI docs           | Storybook 10 with the accessibility addon                                                    |
| Quality           | ESLint 10 (typescript-eslint strict), Prettier, Husky + lint-staged                          |

## Project structure

```text
src/
  app/        # entrypoint, router, layout, query cache, global styles
  pages/      # one slice per screen: login, todos, todo-details, not-found
  features/   # user actions reused across pages: auth, toggle-todo
  entities/   # business concepts: session, todo
  shared/     # api client, config, route paths, UI kit (no business logic)
mocks/        # MSW mock backend (dev + tests)
test/         # test setup and render helpers
e2e/          # Playwright specs
```

A module may only import from layers **below** it, and only through a slice's public `index.ts`. `pnpm lint:fsd` fails the build when that rule is broken. Read [docs/architecture.md](docs/architecture.md) for the full picture.

## Scripts

| Script                             | What it does                                         |
| ---------------------------------- | ---------------------------------------------------- |
| `pnpm dev`                         | Dev server with the mock backend                     |
| `pnpm build` / `pnpm preview`      | Type-checked production build and local preview      |
| `pnpm check`                       | Every static check plus unit and integration tests   |
| `pnpm lint` / `pnpm lint:fsd`      | ESLint / Steiger (architecture)                      |
| `pnpm test` / `pnpm test:coverage` | Vitest                                               |
| `pnpm test:e2e`                    | Playwright (run `pnpm exec playwright install` once) |
| `pnpm slice <layer> <name>`        | Scaffold a new slice with its public API             |
| `pnpm storybook`                   | Component workbench for `shared/ui`                  |

## Documentation

- [Architecture](docs/architecture.md): layers, import rules, data flow and authentication.
- [Adding a slice](docs/adding-a-slice.md): step-by-step guide with a worked example.
- [Testing](docs/testing.md): what each test layer covers and how to write one.
- [Environment](docs/environment.md): configuration and connecting a real API.
- [Decisions](docs/decisions/README.md): why the template looks the way it does.

## Removing the demo

The `todos` and `todo-details` pages, the `todo` entity, the `toggle-todo` feature and the todo handlers in `mocks/` are examples. Delete them, keep `auth` and `session` if you need sign-in, and start adding your own slices.
