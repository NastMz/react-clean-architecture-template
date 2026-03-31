# Decision Log

This directory is reserved for ADRs.

Important reality check: there are no actual ADR files here today. So this folder is a convention placeholder, not an active decision record set.

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

If the team starts making template-level decisions repeatedly, write the ADR instead of letting the rationale rot in chat history or commit messages.
