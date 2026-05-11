# NastMz React Clean Architecture Template

An opinionated React template for creating Clean Architecture SPAs with Vite, TypeScript, React 19, and a small set of production-minded defaults.

## Create a project

Use the package manager you already use:

```bash
npm create @nastmz/clean-react@latest my-app
pnpm create @nastmz/clean-react my-app
yarn create @nastmz/clean-react my-app
bun create @nastmz/clean-react my-app
```

Move into the generated project folder:

```bash
cd my-app
```

By default, dependency installation is skipped and the CLI prints the next commands to run.

## CLI options

```bash
create-clean-react my-app --pm npm
create-clean-react my-app --pm pnpm
create-clean-react my-app --pm yarn
create-clean-react my-app --pm bun
create-clean-react my-app --install
create-clean-react my-app --force
```

- `--pm` overrides package-manager detection.
- `--install` installs dependencies after scaffolding.
- `--force` allows writing into an existing directory.

## What gets created?

The generated application includes the core Clean Architecture structure:

```text
src/
  app/
    bootstrap/
    composition/
    extensions/
    router/
  features/
    auth/
    todo/
  shared/
    contracts/
    kernel/
    network/
    observability/
    ui/
tests/
  e2e/
  integration/
  unit/
```

The template includes:

- a Vite + React 19 + TypeScript SPA baseline;
- feature-first Clean Architecture folders;
- `auth` as the cross-cutting session/protection example;
- `todo` as the protected business feature example;
- explicit feature registration through `src/app/extensions`;
- UI-facing feature APIs and composition-only wiring APIs;
- TanStack Query adapters;
- Zod-based runtime environment parsing;
- Result/Error primitives for application flow;
- in-memory repositories for local-first development;
- shared network resilience primitives;
- OpenTelemetry-ready observability ports/adapters;
- Vitest unit and integration tests;
- Playwright E2E tests;
- Storybook for shared UI atoms;
- contract tests for architecture and scaffold rules.

For the full architecture breakdown, see [`packages/template/docs/architecture.md`](packages/template/docs/architecture.md).

## Feature scaffold

Generated projects include a feature scaffold command:

```bash
pnpm scaffold:feature -- --name billing --label Billing --route /billing
```

Useful flags:

- `--default` marks the feature entry route as the app landing route.
- `--composition` adds composition wiring exports.
- `--dry-run` prints the write plan without writing files.
- `--skip-registry` writes the feature files and prints the manual registry snippet.

For the full workflow, see [`packages/template/docs/feature-playbook.md`](packages/template/docs/feature-playbook.md).

## Common commands after generation

From the generated project root:

```bash
pnpm dev
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm lint
pnpm storybook
```

The template does not require a `.env` file for demo mode. Environment parsing is centralized in `src/app/bootstrap/env.ts` and `src/app/bootstrap/config.ts`.

## Repository layout

This repository contains the published CLI and the canonical template source:

```text
packages/
  cli/       # create-clean-react package
  template/  # generated React application template
```

Workspace commands:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm format
```

## Documentation

- [`packages/cli/README.md`](packages/cli/README.md) - CLI usage.
- [`packages/template/docs/architecture.md`](packages/template/docs/architecture.md) - architecture boundaries and dependency rules.
- [`packages/template/docs/feature-playbook.md`](packages/template/docs/feature-playbook.md) - adding features safely.
- [`packages/template/docs/testing-strategy.md`](packages/template/docs/testing-strategy.md) - test layers and commands.
- [`packages/template/docs/environment.md`](packages/template/docs/environment.md) - runtime configuration.

## License

MIT
