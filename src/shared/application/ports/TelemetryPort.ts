export interface TelemetryPort {
  track(event: string, data?: Record<string, unknown>): void
}

export interface LoggerPort {
  info(message: string, data?: Record<string, unknown>): void
  error(message: string, data?: Record<string, unknown>): void
  warn(message: string, data?: Record<string, unknown>): void
}
