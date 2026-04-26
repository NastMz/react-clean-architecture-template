# Testing Strategy

This template includes unit, integration, and E2E testing layers with a focused baseline.

## Runtime baseline

- Node.js `>=20.19.0` (or `>=22.12.0`)

## Toolchain

- Vitest for unit/integration tests
- Testing Library (`@testing-library/react`, `@testing-library/user-event`)
- `jsdom` browser-like test runtime
- Playwright for E2E (Chromium project)

Relevant config files:

- `vitest.config.ts`
- `playwright.config.ts`
- `tsconfig.test.json`

## Current coverage

### Unit

- shared kernel/network/resilience primitives
- bootstrap env/config
- auth in-memory repository
- todo repository and use cases

### Integration

- auth page flow
- todo page flow
- protected route behavior

### E2E

- `tests/e2e/auth.spec.ts` covering auth login/logout/invalid credentials

## Layer guidance

## Thesis enforcement

- contract tests enforce container vs presentational boundaries.
- integration tests verify auth and todo composition still behaves correctly.

### Domain

Use pure unit tests (no React/DOM/network).

### Application

Test use cases with faked ports and verify orchestration + `Result` behavior.

### Infra

Test repository implementations directly (in-memory behavior in the template baseline).

### Adapters

When needed, test query/mutation options, cache updates, and query keys.

### UI and router

Use integration tests with real providers (`QueryClientProvider`, container context, feature adapters providers).

## Running tests

From the project root:

```bash
pnpm test
pnpm test:watch
pnpm test:e2e
pnpm test:e2e:ui
pnpm test:e2e:report
pnpm storybook
```

## Related docs

- `docs/architecture.md`
- `docs/e2e-testing.md`
- `KNOWN_ISSUES.md`
