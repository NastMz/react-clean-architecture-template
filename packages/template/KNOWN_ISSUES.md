# Known Issues

This file tracks practical limitations that consumers should know before extending the template.

## Current limitations for consumers

### Functional scope

- The reference implementation is centered on two slices: `auth` and `todo`.
- Route surface is currently `/auth` and `/todo`.

### Testing scope is focused

- Unit and integration coverage is strongest around auth, todo, bootstrap, and shared primitives.
- Playwright E2E coverage currently focuses on auth flow on Chromium.

### Storybook coverage is partial

- Storybook is configured and runnable.
- Existing stories are concentrated in shared UI components.

### Observability is extensible, not turnkey

- Telemetry ports and adapters are included.
- Exporter/backend setup is project-specific and must be added by your team.

## For maintainers

Internal status notes and maintainer-only follow-ups are documented in:

- `docs/maintainers/README.md`
