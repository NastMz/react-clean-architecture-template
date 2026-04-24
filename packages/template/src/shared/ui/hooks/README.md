# Shared UI Hooks

This directory is reserved for reusable UI hooks that are truly cross-feature.

## Use this folder for

- generic UI behavior reusable across multiple features
- hooks without feature-specific domain logic

## Do not place here

- feature-specific hooks (`src/features/<feature>/ui/...`)
- composition-only wiring hooks
- application/domain business logic

If a hook becomes feature-specific over time, move it back to that feature.
