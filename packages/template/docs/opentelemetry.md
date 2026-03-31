# OpenTelemetry and Observability

This package includes telemetry abstractions and one OpenTelemetry-backed adapter.

That does NOT mean the template ships a complete observability stack.

## What exists in code

Relevant files:

- `packages/template/src/shared/contracts/TelemetryPort.ts`
- `packages/template/src/shared/observability/ConsoleTelemetry.ts`
- `packages/template/src/shared/observability/OpenTelemetryAdapter.ts`
- `packages/template/src/app/composition/container.ts`

Current behavior in the container:

- browser -> `OpenTelemetryAdapter`
- non-browser/test-like runtime -> `ConsoleTelemetry`
- caller can override both by passing a custom telemetry implementation into `createContainer()`

## What `OpenTelemetryAdapter` actually does

The adapter uses `@opentelemetry/api` to create spans for:

- `track(event, data)` -> `event.<name>` spans
- `info(message, data)` -> `log.info` spans
- `warn(message, data)` -> `log.warn` spans
- `error(message, data)` -> `log.error` spans

It also logs to the browser console. So this is not a silent exporter-only adapter; it is trace API usage plus console output.

## What it does not do by itself

Right now the template does not ship:

- SDK bootstrap code
- tracer provider registration
- exporter wiring
- Jaeger/Tempo/Datadog setup
- dashboard provisioning

So if you run the app as-is, you get the adapter behavior, but you do not magically get a full tracing backend.

## Where telemetry is used today

The auth slice is the concrete example.

`packages/template/src/features/auth/application/authUseCases.ts` tracks:

- `auth.login.attempt`
- `auth.login.success`
- `auth.login.error`
- `auth.logout.success`
- `auth.logout.error`

Repository implementations also emit telemetry for auth operations and session errors.

## Default selection logic

This is the real selection rule in `container.ts`:

```ts
const selectedTelemetry =
  telemetry ?? (typeof window !== 'undefined' ? new OpenTelemetryAdapter() : new ConsoleTelemetry())
```

That means tests are usually simpler because they do not depend on a browser telemetry setup.

## Custom telemetry

You can override the default by passing your own implementation to `createContainer()`.

```ts
import { createContainer } from '@app/composition/container'

const telemetry = {
  track: (event: string, data?: Record<string, unknown>) => {
    // send to your analytics pipeline
  },
  info: (message: string, data?: Record<string, unknown>) => {
    // log
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    // warn
  },
  error: (message: string, data?: Record<string, unknown>) => {
    // error
  },
}

const container = createContainer(telemetry)
```

This is the safer extension point than pretending the shipped adapter already matches your production observability requirements.

## If you want real OTEL export

You need to add your own bootstrap layer that registers an SDK/provider/exporter before the app starts.

The package has some OTEL dependencies installed, but there is no active `otel-init` file wired into `packages/template/src/main.tsx` today.

So any documentation claiming that exporters are already configured would be stale.

## Practical guidance

- keep telemetry behind the shared contract
- track business events from use cases
- use repo/infrastructure telemetry for transport failures and state transitions
- add exporter/bootstrap code only when you know where traces should go

## Honest status

What is production-useful here:

- a port abstraction
- two concrete implementations
- a composition-root seam for overrides
- one feature showing how to emit telemetry

What is still on your team:

- exporter choice
- backend setup
- sampling/privacy policy
- correlation strategy across frontend and backend

If someone says "OpenTelemetry is done" just because the adapter class exists, they're hand-waving.
