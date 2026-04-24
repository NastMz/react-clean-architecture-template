# OpenTelemetry and Observability

The template provides telemetry abstractions and a default OpenTelemetry-based adapter.

## What is included

Relevant files:

- `packages/template/src/shared/contracts/TelemetryPort.ts`
- `packages/template/src/shared/observability/ConsoleTelemetry.ts`
- `packages/template/src/shared/observability/OpenTelemetryAdapter.ts`
- `packages/template/src/app/composition/container.ts`

Container default behavior:

- browser runtime -> `OpenTelemetryAdapter`
- non-browser/test runtime -> `ConsoleTelemetry`
- custom telemetry can be injected via `createContainer(telemetry)`

## OpenTelemetry adapter behavior

`OpenTelemetryAdapter` creates spans for:

- `track(event, data)`
- `info(message, data)`
- `warn(message, data)`
- `error(message, data)`

It also logs to the browser console.

## Extending for production

Exporter/provider/bootstrap setup is project-specific.

If your team needs backend tracing, add SDK/provider/exporter initialization before app startup.

## Where telemetry is already used

`packages/template/src/features/auth/application/authUseCases.ts` tracks auth lifecycle events (attempt, success, failure, logout).

Repository implementations also emit telemetry for auth operations and session-related errors.
