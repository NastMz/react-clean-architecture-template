# ADR-003: TanStack Query for server state, React Router middleware for auth

**Date:** 2026-11-17 · **Status:** Accepted

## Context

Most state in a typical SPA is server state: cached, shared and kept fresh. Route protection must run before any data request for the protected screen.

## Decision

- **TanStack Query** owns server state. Entities expose query-option factories (`todoQueries.list()`), and pages read them with `useSuspenseQuery`. No global client-state store is included until a product needs one.
- **React Router 8 in data mode** owns navigation. Pages are lazy routes whose loaders prefetch with `queryClient.query(...)`.
- **Auth uses route middleware** (`app/routes/auth-middleware.ts`), which runs before the loaders of the protected branch. Loaders run in parallel, so a guard written as a loader could not stop sibling requests.

## Consequences

- One cache and one set of query keys serve components, loaders and mutations.
- Data and code for a page load in parallel, without request waterfalls.
- Framework mode (file-based routes, SSR) is not used. Moving to it later keeps the same loaders and middleware.

## Alternatives considered

- **TanStack Router**: excellent type safety, but React Router is far more widely adopted and has first-class middleware.
- **A framework (Next.js, React Router framework mode)**: the right default when you need SSR. This template targets SPAs served as static files.
