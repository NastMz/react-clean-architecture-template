# Quickstart

Fast path to run `packages/template` and validate the default flow.

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
- canonical protected feature route is `/todo`
- the app shell navigation exposes `Auth` and `Todo`

## 3. Log in with demo credentials

- email: `demo@example.com`
- password: `demo123`

If login succeeds, you should see `Demo User` and a logout button.

## 4. Default runtime mode

By default, auth uses the in-memory repository.

- no backend required
- session is persisted in `localStorage` under `demo_session`

## 5. Optional: switch auth to HTTP mode

Only enable this when your backend matches the auth contract.

```env
VITE_USE_HTTP=true
VITE_API_BASE_URL=https://your-api.example.com
```

Expected endpoints:

- `POST /auth/login`
- `GET /auth/session`
- `POST /auth/logout`
- `POST /auth/refresh`

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

## 7. Sanity checks

- visit `/auth`
- submit the demo form
- open `/todo` and confirm todo CRUD is available while authenticated
- reload and verify the session persists
- click logout and verify `/todo` redirects to `/auth`

## 8. Next docs to read

- `README.md`
- `KNOWN_ISSUES.md`
- `docs/feature-playbook.md`
