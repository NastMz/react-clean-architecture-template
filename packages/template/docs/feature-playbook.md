# Feature Playbook

Use this guide to add a feature without breaking the template boundaries.

## Canonical feature scaffold contract

The **required top-level folders** are:

- `api/`
- `adapters/`
- `application/`
- `domain/`
- `infra/`
- `ui/`

`composition/` is optional.

composition/ is optional.

`api/composition.ts` exists only when app composition or tests need wiring exports.

api/composition.ts exists only when app composition or tests need wiring exports.

## Public API split

- `@features/<feature>/api`: UI-facing exports consumed by pages/router/app hooks.
- `@features/<feature>/api/composition`: wiring exports consumed by extension manifests and tests.

## App integration seam

`src/app/extensions/<feature>.tsx` plus `src/app/extensions/registry.tsx` are the **single app integration seam**.

Rules:

- define one manifest with `defineAppFeature(...)` per feature extension file
- register the feature once in `registry.tsx`
- let the app shell derive providers/routes/navigation/default route from registry outputs
- do not duplicate feature wiring in `container.ts`, `providers.tsx`, or `routes.tsx`

## Canonical example in this template

- `auth`: cross-cutting session and protection concern
- `todo`: protected CRUD business slice

`todo` is intentionally simple and in-memory-first so teams can extend the pattern without backend noise.

## Maintainer notes

Template status and internal follow-ups live in `docs/maintainers/README.md`.
