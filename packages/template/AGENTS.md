# AGENTS.md

Working rules for AI coding agents in this project. Humans: see [README.md](README.md) and [docs/architecture.md](docs/architecture.md).

## Architecture (Feature-Sliced Design v2.1)

- Layers, top to bottom: `app` → `pages` → `features` → `entities` → `shared`. Import only from lower layers.
- Slices on the same layer never import each other. Entities may cross-reference only through `entities/<a>/@x/<b>.ts`.
- Import other slices through their public API with the `@/` alias (`@/entities/todo`). Inside a slice, use relative imports.
- Every slice has an `index.ts` with explicit named exports. Never `export *`.
- Segment names describe purpose: `ui`, `model`, `api`, `lib`, `config`. Never `hooks`, `components`, `types`, `utils`, `helpers`, `services`, `store` or `providers`.
- Pages first: code used by one page stays in that page. Extract to `features`/`entities` only when a second consumer exists.
- New slices: `pnpm slice <layer> <name>`. New routes: `src/app/routes/routes.tsx`, with paths in `src/shared/routes/paths.ts`.

## Data and state

- Server state uses TanStack Query. Add reads as query-option factories in the entity's `api` segment and invalidate by their keys.
- HTTP goes through `apiClient` from `@/shared/api` with a Zod schema for every response body.
- Every new endpoint needs a handler in `mocks/handlers.ts`.
- Forms use React Hook Form with `zodResolver` and a schema from the entity `model`.

## React and TypeScript

- React 19 with the React Compiler: no `useMemo`/`useCallback`/`memo` by default, no `forwardRef` (pass `ref` as a prop), named imports from `react`.
- No `any`, no non-null assertions, type-only imports with `import type`.

## Verification

Run `pnpm check` (typecheck, ESLint, Steiger, Prettier, tests) before finishing. Add or update a colocated test for every behavior change; use `renderApp` from `test/render.tsx` for page-level tests. Update the docs when you change a convention.
