import type { AuthRepository } from '@features/auth/application/ports/AuthRepository'
import type { Credentials, Session } from '@features/auth/domain/User'
import type { TelemetryPort } from '@shared/application/ports/TelemetryPort'
import type { AppError } from '@shared/domain/errors/AppError'
import { AppErrorFactory } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'
import type { HttpClient } from '@shared/infra/http/HttpClient'
import { RetryPolicy } from '@shared/infra/resilience/RetryPolicy'

/**
 * HTTP-based Auth Repository with automatic retry logic
 * Demonstrates resilience patterns for production HTTP calls
 *
 * Expected API endpoints:
 * - POST /auth/login → { user: {...}, token: string }
 * - GET /auth/session → { user: {...}, token: string } | null
 * - POST /auth/logout → void
 *
 * Retry policy:
 * - 3 attempts max
 * - Exponential backoff (100ms → 200ms → 400ms)
 * - Only retries network errors and 5xx status codes
 *
 * @example
 * ```ts
 * const repo = createHttpAuthRepository(
 *   httpClient,
 *   telemetry,
 *   { baseUrl: 'https://api.example.com' }
 * )
 * ```
 */
export interface HttpAuthRepositoryOptions {
  baseUrl: string
}

export class HttpAuthRepository implements AuthRepository {
  private readonly retryPolicy: RetryPolicy
  private sessionCache: Session | null = null
  private httpClient: HttpClient
  private telemetry: TelemetryPort
  private options: HttpAuthRepositoryOptions

  constructor(
    httpClient: HttpClient,
    telemetry: TelemetryPort,
    options: HttpAuthRepositoryOptions,
  ) {
    this.httpClient = httpClient
    this.telemetry = telemetry
    this.options = options
    // Configure retry policy for resilient HTTP calls
    this.retryPolicy = new RetryPolicy(3, {
      baseDelay: 100,
      maxDelay: 5000,
      backoffMultiplier: 2,
    })
  }

  async login(credentials: Credentials): Promise<Result<Session, AppError>> {
    try {
      this.telemetry.track('auth.login.attempt', { email: credentials.email })

      // Use retry policy to handle transient failures
      const result = await this.retryPolicy.execute(() =>
        this.httpClient.request<Session>({
          method: 'POST',
          url: `${this.options.baseUrl}/auth/login`,
          body: credentials,
        }),
      )

      if (result.isErr) {
        this.telemetry.track('auth.login.error', { kind: result.error.kind })
        return Result.err(result.error)
      }

      const session = result.value.data
      this.sessionCache = session
      this.telemetry.track('auth.login.success', {
        userId: session.user.id,
      })

      return Result.ok(session)
    } catch (error) {
      const appError = AppErrorFactory.fromUnknown(error)
      this.telemetry.track('auth.login.error', { kind: appError.kind })
      return Result.err(appError)
    }
  }

  async currentSession(): Promise<Result<Session | null, AppError>> {
    try {
      // Return cached session if available
      if (this.sessionCache) {
        return Result.ok(this.sessionCache)
      }

      // Fetch from server with retry policy
      const result = await this.retryPolicy.execute(() =>
        this.httpClient.request<Session | null>({
          method: 'GET',
          url: `${this.options.baseUrl}/auth/session`,
        }),
      )

      if (result.isErr) {
        this.telemetry.track('auth.session.error', { kind: result.error.kind })
        return Result.err(result.error)
      }

      const session = result.value.data
      this.sessionCache = session
      return Result.ok(session)
    } catch (error) {
      const appError = AppErrorFactory.fromUnknown(error)
      this.telemetry.track('auth.session.error', { kind: appError.kind })
      return Result.err(appError)
    }
  }

  async logout(): Promise<Result<void, AppError>> {
    try {
      this.telemetry.track('auth.logout.attempt')

      // Logout with retry policy
      const result = await this.retryPolicy.execute(() =>
        this.httpClient.request<void>({
          method: 'POST',
          url: `${this.options.baseUrl}/auth/logout`,
          body: {},
        }),
      )

      if (result.isErr) {
        this.telemetry.track('auth.logout.error', { kind: result.error.kind })
        return Result.err(result.error)
      }

      this.sessionCache = null
      this.telemetry.track('auth.logout.success')

      return Result.ok(undefined)
    } catch (error) {
      const appError = AppErrorFactory.fromUnknown(error)
      this.telemetry.track('auth.logout.error', { kind: appError.kind })
      return Result.err(appError)
    }
  }
}

/**
 * Factory function for creating HTTP Auth Repository
 * @param httpClient - HTTP client for making requests
 * @param telemetry - Telemetry for tracking operations
 * @param options - Configuration including base URL
 * @returns Configured HttpAuthRepository instance
 */
export const createHttpAuthRepository = (
  httpClient: HttpClient,
  telemetry: TelemetryPort,
  options: HttpAuthRepositoryOptions,
): AuthRepository => new HttpAuthRepository(httpClient, telemetry, options)
