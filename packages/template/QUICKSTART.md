# Quickstart

Fast path to run this opinionated React SPA architecture template and validate the default flow.

## Prerequisites

- Node.js `>=20.19.0` (or `>=22.12.0`)
- npm, pnpm, yarn, or bun

## 1. Create a project

Use the package manager you already use:

```bash
npm create clean-react@latest my-app
pnpm create clean-react my-app
yarn create clean-react my-app
bun create clean-react my-app
```

Then enter the generated app:

```bash
cd my-app
```

## 2. Install

Use the same package manager:

```bash
npm install
# or: pnpm install / yarn install / bun install
```

## 3. Start the template

Use the matching run command:

```bash
npm run dev
# or: pnpm dev / yarn dev / bun run dev
```

Open `http://localhost:5173`.

Current behavior:

- `/` redirects to `/auth`
- canonical protected feature route is `/todo`
- the app shell navigation exposes `Auth` and `Todo`

## 4. Log in with demo credentials

- email: `demo@example.com`
- password: `demo123`

If login succeeds, you should see `Demo User` and a logout button.

## 5. Default runtime mode

By default, auth uses the in-memory repository.

- no backend required
- session is persisted in `localStorage` under `demo_session`

## 6. Useful commands

From the project root:

```bash
npm run lint
npm run format
npm run typecheck
npm run test
npm run test:e2e
npm run storybook
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
