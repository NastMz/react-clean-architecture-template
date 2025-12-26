# OpenTelemetry Integration

This template includes **OpenTelemetry** for distributed tracing and observability. Events and logs are automatically traced across your application.

## Overview

The `OpenTelemetryAdapter` implements both `TelemetryPort` and `LoggerPort` interfaces, creating spans for every:

- Event tracked via `telemetry.track()`
- Log message via `telemetry.info()`, `telemetry.warn()`, `telemetry.error()`

## Current Setup

By default, the application uses `OpenTelemetryAdapter` in production and `ConsoleTelemetry` in development.

**Location**: `src/shared/infra/telemetry/OpenTelemetryAdapter.ts`

**DI Container**: `src/app/composition/container.ts` automatically selects the telemetry implementation.

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
// src/features/todo/application/todoUseCases.ts
export const createTodoUseCases = (
  repository: TodoRepository,
  telemetry: TelemetryPort & LoggerPort, // Injected dependency
): TodoUseCases => ({
  async listTodos() {
    telemetry.track('todo.list')
    const result = await repository.list()
    result.match({
      ok: (todos) => telemetry.info(`Loaded ${todos.length} todos`),
      err: (error) => telemetry.error('Failed to load todos', { kind: error.kind }),
    })
    return result
  },
})
```

## Configuring an OpenTelemetry Backend

To send traces to a backend (Jaeger, Tempo, Grafana Loki), create `src/app/bootstrap/otel-init.ts`:

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

Then import it early in `src/main.tsx`:

```typescript
import './app/bootstrap/otel-init' // Must be first import
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
```

## Local Development with Jaeger

Run Jaeger locally:

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

## Switching Back to Console Telemetry

For development, edit `src/app/composition/container.ts`:

```typescript
// Before
const telemetry =
  typeof window !== 'undefined' ? new OpenTelemetryAdapter() : new ConsoleTelemetry()

// After (for console output)
const telemetry = new ConsoleTelemetry()
```

## Span Structure

Each telemetry call creates a span:

```
track('todo.create', { title: 'Buy milk' })
  ↓
Span: event.todo.create
  - Attributes:
    - title: "Buy milk"
```

Logs also create spans:

```
error('Failed to load todos', { kind: 'NotFound' })
  ↓
Span: log.error
  - Attributes:
    - message: "Failed to load todos"
    - level: "error"
    - kind: "NotFound"
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

const useCases = createTodoUseCases(repository, mockTelemetry)
expect(mockTelemetry.track).toHaveBeenCalledWith('todo.create', expect.any(Object))
```

## See Also

- [OpenTelemetry JS Documentation](https://opentelemetry.io/docs/instrumentation/js/)
- [OpenTelemetry Concepts](https://opentelemetry.io/docs/concepts/)
- [OTEL Browser Support](https://opentelemetry.io/docs/instrumentation/js/instrumentation/)
