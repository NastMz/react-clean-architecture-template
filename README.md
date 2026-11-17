# React Starter

A production-ready React SPA starter built on [Feature-Sliced Design](https://feature-sliced.design) v2.1, the standard architecture for frontend apps, with its rules enforced in CI by [Steiger](https://github.com/feature-sliced/steiger).

React 19 + React Compiler · TypeScript · Vite 8 · React Router 8 · TanStack Query · React Hook Form + Zod · MSW · Vitest · Playwright · Storybook

## Create a project

```bash
npm create @nastmz/react-starter@latest my-app
# or: pnpm create @nastmz/react-starter my-app
```

```bash
cd my-app
pnpm install
pnpm dev        # demo sign-in: demo@example.com / demo123
```

### Pick a starting point

| `--template`     | You get                                                               | Use it to                        |
| ---------------- | --------------------------------------------------------------------- | -------------------------------- |
| `full` (default) | A small todo app: sign-in, pages, a reusable feature, entities, mocks | Learn the conventions by example |
| `minimal`        | Sign-in, an empty home page and the full toolchain, no example data   | Start your own app with auth     |
| `blank`          | An empty home page and the full toolchain, no sign-in                 | Start an app without auth        |

```bash
pnpm create @nastmz/react-starter my-app --template minimal
```

Every template passes the same checks in CI: typecheck, ESLint, Steiger, Prettier, tests, build, `pnpm audit` and end-to-end tests.

No backend is needed to start: a Mock Service Worker backend serves the API in development and tests. Two env variables point the app at your real API.

### CLI options

| Option                        | Effect                                   |
| ----------------------------- | ---------------------------------------- |
| `-t, --template <name>`       | `full` (default), `minimal` or `blank`   |
| `--pm <npm\|pnpm\|yarn\|bun>` | Override package-manager detection       |
| `--install`                   | Install dependencies after scaffolding   |
| `--force`                     | Allow writing into a non-empty directory |

The template's scripts, Git hooks and CI workflow use pnpm.

## What you get

```text
src/
  app/        # entrypoint, router (lazy pages + auth middleware), layout, query cache
  pages/      # login, todos, todo-details, not-found
  features/   # auth, toggle-todo
  entities/   # session, todo
  shared/     # Zod-validated API client, config, route paths, UI kit
mocks/        # MSW mock backend shared by dev and tests
e2e/          # Playwright specs
```

- **Architecture as a checked contract**: layers import only downward, slices only through their public `index.ts`; `pnpm lint:fsd` fails the build otherwise.
- **A real data boundary**: every request goes through a fetch client that validates responses with Zod, against MSW in dev and tests or your API in production.
- **Modern data loading**: route loaders prefetch TanStack Query data in parallel with lazy page chunks; middleware protects routes before any loader runs.
- **Tests that exercise the real app**: integration tests render the full router against the mock backend; Playwright covers the user journeys.
- **Tooling**: ESLint 10 (typescript-eslint strict), Prettier, Husky + lint-staged, Storybook with accessibility checks, Dependabot, GitHub Actions CI, and `pnpm slice` to scaffold new slices.

Start with the template's [README](packages/template/README.md) and [architecture guide](packages/template/docs/architecture.md).

## Repository layout

```text
packages/
  template/   # the generated application (source of truth)
  cli/        # @nastmz/create-react-starter: bundles the template and the minimal/blank variants
```

Contributing to this repository:

```bash
pnpm install
pnpm -C packages/template check   # typecheck, ESLint, Steiger, Prettier, tests
pnpm -C packages/template test:e2e
pnpm -C packages/cli test
```

Requires Node.js 22.22 or later and pnpm 10.

## Documentation

- [Architecture](packages/template/docs/architecture.md): layers, rules, data flow, authentication
- [Adding a slice](packages/template/docs/adding-a-slice.md)
- [Testing](packages/template/docs/testing.md)
- [Environment and connecting a real API](packages/template/docs/environment.md)
- [Architecture decisions](docs/decisions/README.md) (maintainers)
- [CLI](packages/cli/README.md)

## License

MIT
