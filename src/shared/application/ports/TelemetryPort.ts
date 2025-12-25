/**
 * Telemetry Port
 * Interface for event tracking and analytics
 * Abstracts telemetry provider implementation details
 */
export interface TelemetryPort {
  /**
   * Tracks a user event
   * @param event - Event name identifier
   * @param data - Optional event metadata
   */
  track(event: string, data?: Record<string, unknown>): void
}

/**
 * Logger Port
 * Interface for application logging
 * Abstracts logger implementation details
 */
export interface LoggerPort {
  /**
   * Logs informational message
   * @param message - Message to log
   * @param data - Optional contextual data
   */
  info(message: string, data?: Record<string, unknown>): void

  /**
   * Logs error message
   * @param message - Error message to log
   * @param data - Optional error context
   */
  error(message: string, data?: Record<string, unknown>): void

  /**
   * Logs warning message
   * @param message - Warning message to log
   * @param data - Optional warning context
   */
  warn(message: string, data?: Record<string, unknown>): void
}
