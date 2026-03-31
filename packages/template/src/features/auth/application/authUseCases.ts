import type { LoggerPort, TelemetryPort } from '@shared/application/ports/TelemetryPort'
import type { AppError } from '@shared/domain/errors/AppError'
import { AppErrorFactory } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'

import type { Credentials, Session } from '../domain/User'
import type { AuthRepository } from './ports/AuthRepository'

/**
 * Authentication Use Cases Interface
 * Defines all business logic operations for user authentication
 */
export interface AuthUseCases {
  /**
   * Authenticates a user with email and password
   * Tracks telemetry events for monitoring
   * @param credentials - User's email and password
   * @returns Result containing authenticated Session or AppError
   */
  login(credentials: Credentials): Promise<Result<Session, AppError>>

  /**
   * Logs out the current user
   * Tracks telemetry events for monitoring
   * @returns Result containing void or AppError
   */
  logout(): Promise<Result<void, AppError>>

  /**
   * Retrieves the current user's active session
   * @returns Result containing Session or null if not authenticated
   */
  currentSession(): Promise<Result<Session | null, AppError>>
}

/**
 * Creates authentication use cases with injected dependencies
 * Implements telemetry tracking for all authentication operations
 * @param repository - Auth repository for persistence operations
 * @param telemetry - Telemetry service for tracking events
 * @returns Implementation of AuthUseCases
 */
export const createAuthUseCases = (
  repository: AuthRepository,
  telemetry: TelemetryPort & LoggerPort,
): AuthUseCases => ({
  async login(credentials) {
    telemetry.track('auth.login.attempt', { email: credentials.email })
    const result = await repository.login(credentials)
    result.match({
      ok: (session) => telemetry.track('auth.login.success', { userId: session.user.id }),
      err: (error) => telemetry.track('auth.login.error', { kind: error.kind }),
    })
    return result
  },
  async logout() {
    const result = await repository.logout()
    result.match({
      ok: () => telemetry.track('auth.logout.success'),
      err: (error) => telemetry.track('auth.logout.error', { kind: error.kind }),
    })
    return result
  },
  async currentSession() {
    const result = await repository.currentSession()
    return result
      .map((session) => session ?? null)
      .mapError((error) => AppErrorFactory.fromUnknown(error))
  },
})
