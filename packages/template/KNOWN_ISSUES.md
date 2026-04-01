# Known Issues

This file is intentionally blunt.

The template is usable, but several areas are still partial, uneven, or only demonstrated through the `auth` feature. If you ignore these limits, you will read more confidence into the template than the code deserves.

## Current limitations

### Scope is still narrow

- Only one full vertical slice exists: `auth`.
- The router currently exposes only `/auth`.
- There is no second feature proving cross-feature collaboration, list/detail flows, optimistic updates, pagination, or more complex state orchestration.

### Feature public API pattern exists, but only one feature proves it

- `auth` now has a split public API:
  - `@features/auth/api` for UI-facing consumption
  - `@features/auth/api/composition` for wiring and tests
- This is the intended pattern going forward.
- There is no generator or guardrail that scaffolds this split for new features yet.

### ESLint boundaries are generic now, but they still assume the current feature shape

- App-level imports are restricted to feature public APIs.
- Shared independence is enforced.
- Feature-root and layer rules are generated from the directories under `src/features/*`.
- That means new features inherit the same `@app/*` and cross-feature boundary checks automatically.

Translation: the architecture direction is now encoded in lint config for the current folder convention. If you invent a different feature layout, you need to update the rules on purpose instead of expecting magic.

### `shared` is reorganized, but parts of it are still only placeholders

Current structure is capability-based:

- `shared/contracts`
- `shared/kernel`
- `shared/network`
- `shared/observability`
- `shared/ui`

What is not true anymore:

- there is no active `shared/domain`
- there is no active `shared/application`
- there is no active `shared/infra`
- there is no active `shared/presentation`

Also:

- `src/shared/ui/hooks` is currently just a placeholder README, not a real hook library.

### HTTP auth is real code, not a finished auth solution

- `createHttpAuthRepository` exists and is tested.
- `HttpClient` supports request/response hooks, auth token injection, schema validation, and refresh callback wiring.
- The auth extension manifest in `src/app/extensions/auth.tsx` configures a refresh flow against `POST /auth/refresh`.

What is missing:

- no bundled backend
- no mock API server
- no shared API contract package
- no completed token rotation/session invalidation policy
- no server-side cookie/session example

### Circuit breaker is available but not integrated into auth

- `RetryPolicy` is used by `HttpAuthRepository`.
- `CircuitBreaker` exists and has unit tests.
- The auth HTTP repository does not currently wrap requests with the circuit breaker.

So docs should say "available building block", not "already active in auth".

### Testing is real, but coverage is still narrow

Currently present:

- unit tests for shared kernel/network pieces and auth/bootstrap code
- integration tests for `AuthPage` and `ProtectedRoute`
- Playwright auth E2E tests on Chromium

Not present yet:

- multi-feature test coverage
- coverage threshold enforcement
- broad browser matrix in Playwright
- story-driven interaction testing as a standard workflow

### Storybook is installed, not mature

- Storybook 10 is configured and runnable.
- Current stories are concentrated in shared atoms.
- There is not broad coverage for molecules, pages, or feature slices.
- "Component documentation" exists in the narrow Storybook sense, not as a finished design system.

### Observability is partial by design

- `ConsoleTelemetry` and `OpenTelemetryAdapter` exist.
- The browser path uses `OpenTelemetryAdapter` by default.
- Without an exporter/backend, that does not magically give you meaningful tracing dashboards.

So yes, observability hooks exist. No, the package does not ship a full telemetry stack.

### Docs outside this must stay under suspicion

The files below were rewritten to match the current code:

- `README.md`
- `QUICKSTART.md`
- `KNOWN_ISSUES.md`
- `docs/architecture.md`
- `docs/feature-playbook.md`

Other docs may still contain stale claims and should be verified against code before being trusted blindly.

## Non-goals for the current template snapshot

- Foundry integration is not the priority here.
- SSR/RSC/Next.js support is not what this package is optimized for.
- Enterprise auth edge cases are not closed.
- Full design-system maturity is not closed.
- Generators/scaffolding are not closed.

## If you extend the template

Before adding serious surface area, plan to do at least these follow-up tasks:

1. Create the public API split for every new feature from day one.
2. Decide whether HTTP auth should use circuit breaker, refresh, cookies, or something else for real.
3. Expand tests beyond the auth slice before claiming the template pattern is proven.
4. Keep the feature folder convention stable unless you intentionally update the lint rules with it.
