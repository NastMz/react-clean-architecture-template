# Known Issues & Future Work

## ~~Test Suite (Rolldown/Vitest Issue)~~ ✅ RESOLVED

**Status**: Fixed by switching to standard Vite

The template previously used `rolldown-vite@7.2.5` which had SSR compatibility issues causing:

- Test failures: `__vite_ssr_exportName__ is not defined`
- Export errors in browser: "does not provide an export named 'AppError'"

**Solution**: Switched to standard `vite@^6.0.7`. All tests and exports now work correctly.

The application runs perfectly in dev mode (`pnpm dev`), builds correctly (`pnpm build`), and **tests now pass** (`pnpm test`).

## Future Enhancements

- [x] **Storybook** for component documentation (✅ DONE)
- [x] **Atomic Design** component library (✅ DONE)
- [x] **HTTP repository** example - Posts feature (✅ DONE)
- [ ] **Playwright** E2E testing setup
- [ ] **Plop/Hygen** generators for scaffolding features
- [ ] **OpenTelemetry** integration
- [ ] **Sentry** error tracking
- [ ] **Advanced auth** (token refresh, protected routes)
- [ ] **Form library** integration (React Hook Form + Zod)
- [ ] **UI component library** (optional: shadcn/ui, Chakra, MUI)

## Notes

- **ESLint boundary rules** work but show warnings for async methods without await (acceptable for in-memory repos)
- **Lint-staged** configured but needs git commits to test
- **Husky hooks** ready but need git workflow
