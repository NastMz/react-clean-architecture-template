# Environment Configuration

Environment handling is intentionally centralized.

## Source of truth

- `packages/template/src/app/bootstrap/env.ts`
- `packages/template/src/app/bootstrap/config.ts`

Read env values in bootstrap/composition code, then consume derived config across the app.

## Supported variables

### `VITE_USE_HTTP`

Accepted values:

- `'true'`
- `'false'`
- omitted

Behavior:

- `'true'` selects HTTP auth repository
- `'false'` or omitted selects in-memory auth repository

### `VITE_API_BASE_URL`

- Required only when `VITE_USE_HTTP='true'`
- Must be a valid absolute URL

## Validation

`env.ts` uses Zod to validate:

- allowed values for `VITE_USE_HTTP`
- conditional requirement for `VITE_API_BASE_URL`

Invalid env values fail fast at startup.

## Example

```env
VITE_USE_HTTP=true
VITE_API_BASE_URL=https://your-api.example.com
```

For demo mode, no env file is required.

## Vite notes

- client vars must use `VITE_` prefix
- restart the dev server after changing env files
