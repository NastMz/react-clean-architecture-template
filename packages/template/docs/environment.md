# Environment Configuration

This package keeps environment handling intentionally small.

Right now there are only two documented runtime variables because those are the only ones the code actually reads from `import.meta.env`.

## Source of truth

Environment parsing and config derivation live here:

- `packages/template/src/app/bootstrap/env.ts`
- `packages/template/src/app/bootstrap/config.ts`

Do not scatter direct `import.meta.env` access around the app. The current pattern is: parse once, derive config once, consume config from the composition root.

## Supported variables

### `VITE_USE_HTTP`

Accepted values:

- `'true'`
- `'false'`
- omitted

Behavior:

- `'true'` switches auth to the HTTP repository
- `'false'` or omitted keeps auth in memory mode

### `VITE_API_BASE_URL`

Requirements:

- must be a valid absolute URL when `VITE_USE_HTTP='true'`
- otherwise it may be omitted

`env.test.ts` explicitly verifies that the app does not invent a fake base URL outside HTTP mode.

## Validation rules

The Zod schema in `env.ts` enforces:

- `VITE_API_BASE_URL` is optional by default
- `VITE_USE_HTTP` can only be `'true'` or `'false'`
- `VITE_API_BASE_URL` becomes required when `VITE_USE_HTTP='true'`

If those rules fail, startup throws a validation error instead of silently running with nonsense config.

## Derived runtime config

`createAppConfig()` currently derives:

- `apiBaseUrl`
- `useHttp`
- `authRepositoryType`
- `featureFlags` as an empty object

That last one is not a real feature-flag system yet. It is just a placeholder slot in the config shape.

## Practical setup

The package includes `.env.example` and ignores local env files in `packages/template/.gitignore`.

Typical local setup:

```env
VITE_USE_HTTP=true
VITE_API_BASE_URL=https://your-api.example.com
```

If you want demo mode, you usually do not need any env file at all.

## Usage pattern

Read config from composition/bootstrap code, not from random feature files.

```ts
import { getConfig } from '@app/bootstrap/config'

const config = getConfig()

if (config.authRepositoryType === 'http') {
  // wire HTTP repository
}
```

That keeps env concerns out of UI and feature internals.

## Vite-specific notes

- client-exposed variables must use the `VITE_` prefix
- changing env values requires restarting the Vite dev server
- HMR cache reset in `env.ts` and `config.ts` does not remove the need for a restart when env files change

## What this document should not claim

It would be dishonest to say the package already has:

- multiple environment profiles with rich app behavior
- a finished feature flag system
- secret management
- server/runtime config separation beyond Vite client envs

It has a small, correct env boundary for one optional HTTP-backed auth flow. That's it.
