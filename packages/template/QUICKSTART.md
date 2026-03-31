# Quickstart

This is the shortest honest path to get `packages/template` running and verify what is actually implemented today.

## 1. Install

From repo root:

```bash
pnpm install
```

## 2. Start the template

From repo root:

```bash
pnpm -C packages/template dev
```

Or from `packages/template`:

```bash
pnpm dev
```

Open `http://localhost:5173`.

Current behavior:

- `/` redirects to `/auth`
- the only real feature route in the template is `/auth`
- the app shell navigation currently exposes only `Auth`

## 3. Log in with the real demo credentials

Use exactly this:

- email: `demo@example.com`
- password: `demo123`

The form is prefilled with those values in `src/features/auth/ui/AuthPage.tsx`.

If login succeeds, you should see `Demo User` and a logout button.

## 4. Understand the default runtime mode

By default, auth runs against the in-memory repository.

That means:

- no backend is required
- session state is persisted in `localStorage` under `demo_session`
- this is good for demos and tests, not evidence of a finished backend integration

## 5. Optional: switch auth to HTTP mode

Only do this if you already have a backend that matches the contract.

Required env values:

```env
VITE_USE_HTTP=true
VITE_API_BASE_URL=https://your-api.example.com
```

Expected endpoints today:

- `POST /auth/login`
- `GET /auth/session`
- `POST /auth/logout`
- `POST /auth/refresh`

Important:

- there is no bundled mock API server
- there is no generated client
- there is no completed auth platform around refresh/logout/token rotation
- `createHttpAuthRepository` exists, but production readiness still depends on your backend and your auth policy

## 6. Useful commands

From `packages/template`:

```bash
pnpm lint
pnpm format
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm storybook
```

What these actually cover:

- `lint`: TypeScript/React/import boundary rules, not Markdown docs
- `format`: Prettier check, including Markdown
- `test`: Vitest unit + integration tests
- `test:e2e`: Playwright auth flow tests on Chromium
- `storybook`: local component sandbox, currently centered on shared atoms

## 7. Sanity checks after startup

- visit `/auth`
- submit the prefilled demo form
- reload the page and verify the session is still there
- click logout and verify the form comes back

If those steps fail, the template is not in a healthy state.

## 8. Before adding another feature

Read these first:

- `README.md`
- `KNOWN_ISSUES.md`
- `docs/feature-playbook.md`

Seriously. The template has a clear pattern now, but it is still a small codebase with sharp edges. If you skip the current constraints, you will create boundary debt fast.
