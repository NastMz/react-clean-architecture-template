# Environment

Configuration is read once at startup in `src/shared/config/env.ts` and validated with Zod, so a bad value fails immediately with a clear error.

| Variable           | Default                                | Purpose                                        |
| ------------------ | -------------------------------------- | ---------------------------------------------- |
| `VITE_API_URL`     | `/api`                                 | Base URL of the backend (trailing `/` removed) |
| `VITE_API_MOCKING` | `enabled` in dev, `disabled` in builds | Serve the API from the MSW mock backend        |

Set them in `.env.local` (git-ignored) or in your CI/hosting provider. Only `VITE_`-prefixed variables reach the browser, so never put secrets in them.

## Connecting a real API

1. `.env.local`:

   ```bash
   VITE_API_URL=https://api.example.com
   VITE_API_MOCKING=disabled
   ```

2. Make sure the backend allows your origin (CORS), or proxy `/api` through Vite with `server.proxy` in `vite.config.ts` and keep `VITE_API_URL=/api`.
3. Keep the response shapes in sync with the Zod schemas in `entities/*/model`. A mismatch surfaces as `Unexpected response from GET /...`.
4. When the backend covers everything, delete `mocks/browser.ts`, the `enableApiMocking` call in `src/app/entrypoint/main.tsx` and `public/mockServiceWorker.js`. Keep `mocks/handlers.ts` and `mocks/node.ts` for tests.

## Adding a variable

1. Add it to the schema in `src/shared/config/env.ts` and expose it on `AppEnv`.
2. Declare it in `src/vite-env.d.ts` for editor autocompletion.
3. Read it through `env` from `@/shared/config`, never through `import.meta.env` directly.
