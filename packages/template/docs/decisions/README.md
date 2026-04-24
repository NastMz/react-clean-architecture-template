# Decision Log

Maintainer-facing ADR directory.

## When to add an ADR

Add one when a decision is architectural, non-obvious, and likely to be revisited, for example:

- why a feature exposes `api` and `api/composition`
- why a transport or auth strategy was chosen
- why a boundary rule exists in ESLint
- why a shared primitive belongs in `shared/network` or `shared/kernel`

## Template

```markdown
# ADR-XXX: Title

**Date:** YYYY-MM-DD
**Status:** Accepted | Deprecated | Superseded

## Context

What problem or pressure are we responding to?

## Decision

What are we choosing and what is in scope?

## Consequences

What trade-offs, limitations, or follow-up work does this introduce?

## Alternatives Considered

What did we reject, and why?
```

## Recommendation

When a decision impacts template architecture, boundaries, or extension contracts, capture it as an ADR in this folder.
