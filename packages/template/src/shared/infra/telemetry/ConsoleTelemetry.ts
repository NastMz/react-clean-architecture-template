import type { LoggerPort, TelemetryPort } from '@shared/application/ports/TelemetryPort'

/**
 * Console-based implementation of Telemetry and Logger ports
 * Outputs events and logs to browser console
 * Suitable for development and debugging
 * In production, replace with real analytics service
 */
export class ConsoleTelemetry implements TelemetryPort, LoggerPort {
  /**
   * Logs tracking event to console
   */
  track(event: string, data?: Record<string, unknown>): void {
    console.info(`[telemetry] ${event}`, data ?? {})
  }

  /**
   * Logs informational message
   */
  info(message: string, data?: Record<string, unknown>): void {
    console.info(message, data ?? {})
  }

  /**
   * Logs warning message
   */
  warn(message: string, data?: Record<string, unknown>): void {
    console.warn(message, data ?? {})
  }

  /**
   * Logs error message
   */
  error(message: string, data?: Record<string, unknown>): void {
    console.error(message, data ?? {})
  }
}
