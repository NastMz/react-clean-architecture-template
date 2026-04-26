# Stage A Gate Checklist

Stage A is accepted only when the core Vite/Vitest/config normalization is complete and all checks below pass without relying on Storybook execution.

## Acceptance checks

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`

## Notes

- Storybook execution is intentionally excluded from this gate.
- Stage B begins only after all Stage A checks are green.
