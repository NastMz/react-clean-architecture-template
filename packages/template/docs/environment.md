# Environment Configuration

Environment handling is intentionally centralized.

## Source of truth

- `packages/template/src/app/bootstrap/env.ts`
- `packages/template/src/app/bootstrap/config.ts`

Read env values in bootstrap/composition code, then consume derived config across the app.

## Supported variables

The template currently does not require env variables.

`env.ts` and `config.ts` are still the centralized place to add runtime variables when a consuming app defines its own integrations.

## Validation

`env.ts` uses Zod for runtime parsing and can be extended with project-specific variables.

Invalid env values fail fast at startup.

For demo mode, no `.env` file is required.

## Vite notes

- client vars must use `VITE_` prefix
- restart the dev server after changing env files
