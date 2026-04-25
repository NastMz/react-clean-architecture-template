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

`api/composition.ts` exists only when app composition or tests need wiring exports.

## Scaffold command

Use the scaffold to generate the canonical feature surface with explicit files:

```bash
pnpm scaffold:feature -- --name billing --label Billing --route /billing
```

Flags:

- `--default`: marks the feature entry route as the app landing route.
- `--composition`: adds `composition/` and `api/composition.ts` for wiring exports.
- `--dry-run`: prints the write plan and exits without writing.
- `--skip-registry`: writes feature files and extension manifest, then prints the exact manual registry snippet.

The scaffold is explicit and editable. It does not do runtime auto-discovery, decorators, or hidden DI wiring.

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

## Manual review checklist

- confirm generated routes and labels match your product language.
- confirm UI-facing imports come from `@features/<feature>/api`.
- confirm wiring/test imports come from `@features/<feature>/api/composition`.
- confirm only one default entry route is active in the registry.

## Canonical example in this template

- `auth`: cross-cutting session and protection concern
- `todo`: protected CRUD business slice

`todo` is intentionally simple and in-memory-first so teams can extend the pattern without backend noise.

## Shared UI promotion rule

- promote to shared UI only after demonstrated reuse in at least 2 features.
- avoid speculative shared abstractions.
- keep single-feature UI local under `features/<feature>/ui` until reuse is proven.

## Notes

For architecture-level decisions that affect this playbook, document them as ADRs in `docs/decisions/README.md`.
