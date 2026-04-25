# AGENTS.md

## Purpose

This file gives AI coding agents the working rules for this project.

The template is intentionally small and opinionated. Preserve the contracts before adding convenience.

## Core rules

- Do not build after changes.
- Do not create commits unless the user explicitly asks.
- Verify technical claims in code/tests/docs before stating them.
- Prefer minimal, contract-preserving changes over broad rewrites.

## Template intent

This project is an opinionated architecture baseline for React SPAs.

Its public intent is to make React SPA startup repeatable with consistent architectural standards and less accidental boilerplate.

Canonical features:

- `auth` → cross-cutting session/protection example
- `todo` → simple business feature example

Do not re-introduce demo features unless the user explicitly asks.

## Architecture rules

- App integration happens through `src/app/extensions/<feature>.tsx` and `src/app/extensions/registry.tsx`.
- Do not wire features directly in parallel app files when the registry contract can handle it.
- `src/app/*` may consume features only through `@features/*/api` or `@features/*/api/composition`.
- `src/shared/*` must stay independent from `@app/*` and `@features/*`.

## Feature scaffold contract

Required feature folders:

- `api/`
- `adapters/`
- `application/`
- `domain/`
- `infra/`
- `ui/`

Optional folder:

- `composition/`

Public API split:

- `@features/<feature>/api` → UI-facing consumption
- `@features/<feature>/api/composition` → wiring/tests only

## UI thesis rules

Frontend maintainability here depends on small composable units with clear responsibilities.

- Page/container components orchestrate hooks, mutation callbacks, and error derivation.
- Presentational components render structure and visual states from props.
- Presentational components must not import hooks, adapters, use cases, repositories, or `@app/*`.
- Separate layout, presentation, state, and domain concerns when the feature complexity justifies it.
- Do not force abstraction by size alone; extract only when reuse or clarity justifies it.

## Shared UI promotion rule

- Keep single-feature UI inside `src/features/<feature>/ui`.
- Promote UI into `src/shared/ui/*` only after demonstrated reuse in at least 2 features.
- Avoid speculative shared abstractions and orphan components.

## React / TypeScript rules

- Use React 19 style: no `React.` namespace types, no default React import.
- Do not add `useMemo` / `useCallback` by default.
- Prefer explicit `import type` for type-only imports.
- Do not use `any`.

## Testing rules

- Follow strict TDD when changing behavior: RED → GREEN → REFACTOR.
- Prefer targeted validation for touched areas.
- Do not build as a validation step.

Useful commands:

- `pnpm test`
- `pnpm test:e2e`
- `pnpm typecheck`
- `pnpm lint`

## Documentation rules

- Keep user-facing docs focused on template consumers.
- Keep maintainer/internal status out of consumer-facing template docs.
- When changing contracts, update docs and contract tests together.

## High-value files

- `README.md`
- `docs/architecture.md`
- `docs/feature-playbook.md`
- `tests/unit/contract/featureScaffoldContract.test.ts`
- `src/app/extensions/registry.tsx`

When in doubt, preserve the template's minimal surface and strengthen the contract instead of adding more demo code.
