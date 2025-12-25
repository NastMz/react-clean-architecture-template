# Decision Log

This directory contains Architectural Decision Records (ADRs) documenting key design choices.

## Template

```markdown
# ADR-XXX: Title

**Date:** YYYY-MM-DD
**Status:** Accepted | Deprecated | Superseded

## Context

What is the issue we're facing?

## Decision

What did we decide?

## Consequences

What are the trade-offs?

## Alternatives Considered

What else did we think about?
```

## Example ADRs

- `001-use-result-monad.md` – Why we use `Result<T, E>` instead of throwing exceptions
- `002-manual-di-composition.md` – Why we don't use DI frameworks
- `003-tanstack-query-for-server-state.md` – Why TanStack Query over Redux
- `004-eslint-boundary-enforcement.md` – How we prevent layer violations

_Feel free to add new ADRs as the project evolves._
