import type { LoggerPort, TelemetryPort } from '../../application/ports/TelemetryPort'

export class ConsoleTelemetry implements TelemetryPort, LoggerPort {
  track(event: string, data?: Record<string, unknown>): void {
    console.info(`[telemetry] ${event}`, data ?? {})
  }

  info(message: string, data?: Record<string, unknown>): void {
    console.info(message, data ?? {})
  }

  warn(message: string, data?: Record<string, unknown>): void {
    console.warn(message, data ?? {})
  }

  error(message: string, data?: Record<string, unknown>): void {
    console.error(message, data ?? {})
  }
}
