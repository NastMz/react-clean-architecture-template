# ADR-001: Feature-Sliced Design instead of layered Clean Architecture

**Date:** 2026-11-17 · **Status:** Accepted

## Context

Earlier versions of this template ported backend Clean Architecture to React: every feature had `domain`, `application` (use cases and repository ports), `infra`, `adapters`, `composition` (a React context for dependency injection) and `api` folders, wired through a feature registry. Each feature needed about ten wiring files, and most use cases only forwarded calls to a repository.

That layering is a niche practice in React. The approaches teams actually standardize on are feature-based structure (for example Bulletproof React) and Feature-Sliced Design. Only FSD has a published specification and an official linter, which is the property that makes the .NET Clean Architecture templates worth following.

## Decision

Organize the app with FSD v2.1 (`app`, `pages`, `features`, `entities`, `shared`), following its "pages first" guidance, and enforce it with Steiger in CI. Keep the Clean Architecture ideas that still pay off in a frontend: dependencies point one way, business rules live in pure modules (`entities/*/model`), and slices expose an explicit public API.

## Consequences

- Fewer files per feature and no hand-written dependency-injection layer; TanStack Query and module boundaries do that job.
- New contributors can learn the structure from the FSD documentation instead of a project-specific guide.
- Boundaries are checked by a dedicated tool rather than custom ESLint regexes.
- FSD has a learning curve, and Steiger is still pre-1.0, so its rules can change between versions.

## Alternatives considered

- **Keep the layered template**: rejected; high ceremony for little isolation benefit in a UI codebase.
- **Bulletproof React**: the most adopted structure, but it is a set of guidelines without a specification or a linter.
