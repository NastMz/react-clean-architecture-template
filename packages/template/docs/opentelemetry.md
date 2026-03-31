# OpenTelemetry Integration

This template includes **OpenTelemetry** for distributed tracing and observability. Events and logs are automatically traced across your application.

## Overview

The `OpenTelemetryAdapter` implements both `TelemetryPort` and `LoggerPort` interfaces, creating spans for every:

- Event tracked via `telemetry.track()`
- Log message via `telemetry.info()`, `telemetry.warn()`, `telemetry.error()`

## Current Setup

The container automatically selects the best telemetry implementation:

- **Browser (default)**: `OpenTelemetryAdapter` - Creates spans invisibly, ready for backend exporter
- **Tests/SSR (Node.js)**: `ConsoleTelemetry` - Visible logging for debugging
- **Custom**: Pass your own `TelemetryPort` implementation to `createContainer()`

**Location**: `src/shared/infra/telemetry/OpenTelemetryAdapter.ts` and `ConsoleTelemetry.ts`

**DI Container**: `src/app/composition/container.ts` automatically selects based on environment.

## Telemetry Selection Logic

```typescript
export const createContainer = (telemetry?: TelemetryPort & LoggerPort) => {
  const selectedTelemetry =
    telemetry ??
    (typeof window !== 'undefined'
      ? new OpenTelemetryAdapter() // Browser: invisible, ready to extend
      : new ConsoleTelemetry()) // Node.js/Tests: visible logs
  // ...
}
```

This means:

| Environment        | Default              | Behavior                                   |
| ------------------ | -------------------- | ------------------------------------------ |
| **Browser (Prod)** | OpenTelemetryAdapter | Spans created but not exported (invisible) |
| **Tests/SSR**      | ConsoleTelemetry     | Logs visible in console for debugging      |
| **Custom**         | Your implementation  | Whatever you pass to `createContainer()`   |

## Architecture

```
TelemetryPort + LoggerPort (contracts)
         ↓
    OpenTelemetryAdapter
         ↓
   @opentelemetry/api
         ↓
   [Browser Context API]
```

## Usage in Features

Every feature automatically gets telemetry:

```typescript
// src/features/auth/application/authUseCases.ts
export const createAuthUseCases = (
  repository: AuthRepository,
  telemetry: TelemetryPort & LoggerPort, // Injected dependency
): AuthUseCases => ({
  async login(credentials) {
    telemetry.track('auth.login', { email: credentials.email })
    const result = await repository.login(credentials)
    result.match({
      ok: (user) => telemetry.info(`User logged in: ${user.email}`),
      err: (error) => telemetry.error('Failed to login', { kind: error.kind }),
    })
    return result
  },
})
```

## Switching Telemetry Implementations

### Default (Browser): Invisible Tracing

By default in the browser, `OpenTelemetryAdapter` creates spans but they go nowhere:

```typescript
// Just works, no configuration needed
const container = createContainer()
// OpenTelemetryAdapter is used automatically
```

This is **production-safe**: no console noise, no performance impact unless you configure an exporter.

### For Testing: Enable Visible Logs

In tests, `ConsoleTelemetry` is automatically used so you can see logs:

```typescript
import { ConsoleTelemetry } from '@shared/infra/telemetry/ConsoleTelemetry'
import { createContainer } from '@app/composition/container'

const container = createContainer()
// Tests automatically get ConsoleTelemetry (visible logs)
```

### Custom Implementation

Pass your own telemetry adapter:

```typescript
import { createContainer } from '@app/composition/container'

const customTelemetry = new MyCustomAdapter()
const container = createContainer(customTelemetry)
```

## Enabling Backend Export

By default, spans are created but **not exported**. To send them somewhere:

### Local Development with Jaeger

```typescript
import { BasicTracerProvider, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

const exporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces', // Or your Jaeger/Tempo endpoint
})

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'react-app',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
)

const tracerProvider = new BasicTracerProvider({ resource })
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(exporter))

// Set the global tracer provider
import { trace } from '@opentelemetry/api'
trace.setGlobalTracerProvider(tracerProvider)
```

Then import it early in `src/main.tsx` **before anything else**:

```typescript
import './app/bootstrap/otel-init' // MUST be first import
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Running Jaeger Locally

```bash
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

Then access traces at: http://localhost:16686

## Production Deployment

For production, use:

- **Jaeger** - Open source, best for on-prem
- **Grafana Tempo** - Cloud-native, integrates with Loki/Prometheus
- **Google Cloud Trace** - For GCP
- **AWS X-Ray** - For AWS
- **Datadog** - Commercial APM

Each has its own exporter in the `@opentelemetry` ecosystem.

## Overriding Telemetry for Specific Environments

The container defaults are smart, but you can override:

**Force ConsoleTelemetry everywhere (verbose logging):**

```typescript
import { createContainer } from '@app/composition/container'
import { ConsoleTelemetry } from '@shared/infra/telemetry/ConsoleTelemetry'

const container = createContainer(new ConsoleTelemetry())
```

**Use custom adapter:**

```typescript
class MyDatadogAdapter implements TelemetryPort, LoggerPort {
  track(event, data) {
    // Send to Datadog...
  }
  // ... other methods
}

const container = createContainer(new MyDatadogAdapter())
```

## Span Structure

Each telemetry call creates a span:

```
track('auth.login', { email: 'user@example.com' })
  ↓
Span: event.auth.login
  - Attributes:
    - email: "user@example.com"
```

Logs also create spans:

```
error('Failed to login', { kind: 'Unauthorized' })
  ↓
Span: log.error
  - Attributes:
    - message: "Failed to login"
    - level: "error"
    - kind: "Unauthorized"
  - Exception recorded
```

## Testing with OpenTelemetry

Tests use `ConsoleTelemetry` by default to keep output simple. You can inject a mock:

```typescript
const mockTelemetry = {
  track: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

const useCases = createAuthUseCases(repository, mockTelemetry)
expect(mockTelemetry.track).toHaveBeenCalledWith('auth.login', expect.any(Object))
```

## See Also

- [OpenTelemetry JS Documentation](https://opentelemetry.io/docs/instrumentation/js/)
- [OpenTelemetry Concepts](https://opentelemetry.io/docs/concepts/)
- [OTEL Browser Support](https://opentelemetry.io/docs/instrumentation/js/instrumentation/)
