# ADR-002: MSW as the mock backend for development and tests

**Date:** 2026-11-17 · **Status:** Accepted

## Context

A template has no backend, but it must still show a real data boundary: HTTP requests, response validation, error handling and authentication. The previous version used in-memory repositories, so its HTTP client was never exercised by the app.

## Decision

The app always talks HTTP through `shared/api`. [Mock Service Worker](https://mswjs.io) answers those requests: in the browser during development (`VITE_API_MOCKING`, enabled by default in dev only) and in Node during tests. Handlers live in `mocks/`, outside `src`, because they simulate another system.

## Consequences

- The same request code runs against the mock and a real API; switching is a configuration change.
- Integration tests cover routing, loaders, middleware, schemas and error paths without mocking modules.
- The mock contract can drift from the real API; keep the handlers in sync, or generate them from an OpenAPI spec.
- The MSW chunk is only downloaded when mocking is enabled.

## Alternatives considered

- **In-memory repositories**: hide the network layer entirely.
- **A separate fake server (json-server)**: one more process to run, and nothing shared with the tests.
