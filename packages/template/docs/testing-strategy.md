# Testing Strategy

This template includes unit, integration, and E2E testing layers with a focused baseline.

## Toolchain

- Vitest for unit/integration tests
- Testing Library (`@testing-library/react`, `@testing-library/user-event`)
- `jsdom` browser-like test runtime
- Playwright for E2E (Chromium project)

Relevant config files:

- `packages/template/vite.config.ts`
- `packages/template/playwright.config.ts`
- `packages/template/tsconfig.test.json`

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

- `packages/template/tests/e2e/auth.spec.ts` covering auth login/logout/invalid credentials

## Layer guidance

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

From `packages/template`:

```bash
pnpm test
pnpm test:watch
pnpm test:e2e
pnpm test:e2e:ui
pnpm test:e2e:report
```

From repo root, run `pnpm -C packages/template <script>`.

## Related docs

- `packages/template/docs/architecture.md`
- `packages/template/docs/e2e-testing.md`
- `packages/template/KNOWN_ISSUES.md`
- `packages/template/docs/maintainers/README.md`
