import { trace } from '@opentelemetry/api'
import type { LoggerPort, TelemetryPort } from '@shared/application/ports/TelemetryPort'

/**
 * OpenTelemetry implementation of Telemetry and Logger ports
 * Integrates with OpenTelemetry SDK for distributed tracing
 * Suitable for production observability
 */
export class OpenTelemetryAdapter implements TelemetryPort, LoggerPort {
  private tracer = trace.getTracer('react-app')

  /**
   * Tracks a user event using OpenTelemetry spans
   * Creates a span for each event and adds attributes
   */
  track(event: string, data?: Record<string, unknown>): void {
    const span = this.tracer.startSpan(`event.${event}`)
    try {
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          span.setAttributes({
            [key]: this.serializeAttribute(value),
          })
        })
      }
    } finally {
      span.end()
    }
  }

  /**
   * Logs informational message with trace context
   */
  info(message: string, data?: Record<string, unknown>): void {
    const span = this.tracer.startSpan('log.info')
    try {
      span.setAttributes({
        message,
        level: 'info',
        ...this.serializeData(data),
      })
      console.info(`[otel-info] ${message}`, data ?? {})
    } finally {
      span.end()
    }
  }

  /**
   * Logs warning message with trace context
   */
  warn(message: string, data?: Record<string, unknown>): void {
    const span = this.tracer.startSpan('log.warn')
    try {
      span.setAttributes({
        message,
        level: 'warn',
        ...this.serializeData(data),
      })
      console.warn(`[otel-warn] ${message}`, data ?? {})
    } finally {
      span.end()
    }
  }

  /**
   * Logs error message with trace context
   */
  error(message: string, data?: Record<string, unknown>): void {
    const span = this.tracer.startSpan('log.error')
    try {
      span.setAttributes({
        message,
        level: 'error',
        ...this.serializeData(data),
      })
      span.recordException(new Error(message))
      console.error(`[otel-error] ${message}`, data ?? {})
    } finally {
      span.end()
    }
  }

  /**
   * Serializes a single attribute value to OpenTelemetry compatible format
   */
  private serializeAttribute(value: unknown): string | number | boolean {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value
    }
    if (value === null || value === undefined) {
      return String(value)
    }
    return JSON.stringify(value)
  }

  /**
   * Serializes data object to OpenTelemetry span attributes
   */
  private serializeData(data?: Record<string, unknown>): Record<string, string | number | boolean> {
    if (!data) return {}
    const serialized: Record<string, string | number | boolean> = {}
    Object.entries(data).forEach(([key, value]) => {
      serialized[key] = this.serializeAttribute(value)
    })
    return serialized
  }
}
