# Maintainer Notes

This document is maintainer-facing.

## Purpose

Keep project-state details and internal follow-ups out of user-facing docs, while preserving architectural contracts for future automation.

## Contract checkpoints for future CLI work

- Feature scaffold contract remains:
  - required folders: `api`, `adapters`, `application`, `domain`, `infra`, `ui`
  - optional folder: `composition`
- Public API split remains:
  - `@features/<feature>/api` (UI-facing)
  - `@features/<feature>/api/composition` (wiring/tests)
- App integration seam remains:
  - `src/app/extensions/<feature>.tsx`
  - `src/app/extensions/registry.tsx`

## Current maintainer focus areas

- Expand examples beyond `auth`/`todo` while preserving lint boundary rules
- Keep docs/tests synchronized with the scaffold contract
- Add ADRs under `docs/decisions/` when architecture decisions are made
- Improve testing breadth (additional E2E flows and browser matrix) as the template grows
- Decide whether and how to integrate `CircuitBreaker` in HTTP auth path

## Internal references

- `packages/template/tests/unit/contract/featureScaffoldContract.test.ts`
- `packages/template/docs/feature-playbook.md`
- `packages/template/docs/architecture.md`
