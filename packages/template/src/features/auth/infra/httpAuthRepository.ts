import type { AuthRepository } from '@features/auth/application/ports/AuthRepository'
import type { Credentials, Session } from '@features/auth/domain/User'
import type { TelemetryPort } from '@shared/contracts/TelemetryPort'
import type { AppError } from '@shared/kernel/AppError'
import { AppErrorFactory } from '@shared/kernel/AppError'
import { Result } from '@shared/kernel/Result'
import { CircuitBreaker, CircuitBreakerError } from '@shared/network/CircuitBreaker'
import type { HttpClient } from '@shared/network/HttpClient'
import type { HttpResponse } from '@shared/network/HttpClient'
import { RetryPolicy } from '@shared/network/RetryPolicy'
import { z } from 'zod'

const authSessionDtoSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    email: z.string().email(),
    name: z.string().min(1),
  }),
  token: z.string().min(1),
})

const nullableAuthSessionDtoSchema = authSessionDtoSchema.nullable()

type AuthSessionDto = z.infer<typeof authSessionDtoSchema>

const mapSessionDtoToDomain = (dto: AuthSessionDto): Session => ({
  user: {
    id: dto.user.id,
    email: dto.user.email,
    name: dto.user.name,
  },
  token: dto.token,
})

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
  retry?: {
    maxAttempts?: number
    baseDelay?: number
    maxDelay?: number
    backoffMultiplier?: number
  }
  circuitBreaker?: {
    failureThreshold?: number
    resetTimeout?: number
  }
}

interface RetryableOperationErrorShape {
  retryable: true
  appError: AppError
  statusCode?: number
}

class RetryableOperationError extends Error implements RetryableOperationErrorShape {
  readonly retryable = true as const
  readonly appError: AppError
  readonly statusCode?: number

  constructor(appError: AppError, statusCode?: number) {
    super(appError.message)
    this.name = 'RetryableOperationError'
    this.appError = appError
    this.statusCode = statusCode
  }
}

const getStatusCode = (error: AppError): number | undefined => {
  if (
    typeof error.cause === 'object' &&
    error.cause !== null &&
    'statusCode' in error.cause &&
    typeof (error.cause as Record<string, unknown>).statusCode === 'number'
  ) {
    return (error.cause as Record<string, unknown>).statusCode as number
  }

  return undefined
}

const toRetryableOperationError = (error: AppError): RetryableOperationError | null => {
  if (error.kind === 'Network') {
    return new RetryableOperationError(error)
  }

  const statusCode = getStatusCode(error)
  if (statusCode !== undefined && statusCode >= 500) {
    return new RetryableOperationError(error, statusCode)
  }

  return null
}

const isRetryableOperationError = (error: unknown): error is RetryableOperationError =>
  error instanceof RetryableOperationError

export class HttpAuthRepository implements AuthRepository {
  private readonly retryPolicy: RetryPolicy
  private readonly circuitBreaker: CircuitBreaker<Result<HttpResponse<unknown>, AppError>>
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
    const retryOptions = options.retry ?? {}
    const circuitBreakerOptions = options.circuitBreaker ?? {}
    // Configure retry policy for resilient HTTP calls
    this.retryPolicy = new RetryPolicy(retryOptions.maxAttempts ?? 3, {
      baseDelay: retryOptions.baseDelay ?? 100,
      maxDelay: retryOptions.maxDelay ?? 5000,
      backoffMultiplier: retryOptions.backoffMultiplier ?? 2,
    })
    this.circuitBreaker = new CircuitBreaker<Result<HttpResponse<unknown>, AppError>>({
      failureThreshold: circuitBreakerOptions.failureThreshold,
      resetTimeout: circuitBreakerOptions.resetTimeout,
    })
  }

  private async executeWithRetry<T>(
    operation: () => Promise<Result<HttpResponse<T>, AppError>>,
  ): Promise<Result<HttpResponse<T>, AppError>> {
    return this.retryPolicy.execute(async () => {
      const result = await operation()

      if (result.isErr) {
        const retryableError = toRetryableOperationError(result.error)
        if (retryableError) {
          throw retryableError
        }
      }

      return result
    })
  }

  private async executeResilient<T>(
    operation: () => Promise<Result<HttpResponse<T>, AppError>>,
  ): Promise<Result<HttpResponse<T>, AppError>> {
    try {
      return (await this.circuitBreaker.execute(async () =>
        this.executeWithRetry(operation),
      )) as Result<HttpResponse<T>, AppError>
    } catch (error) {
      if (isRetryableOperationError(error)) {
        return Result.err(error.appError)
      }

      if (error instanceof CircuitBreakerError) {
        return Result.err(
          AppErrorFactory.serviceUnavailable('Authentication service temporarily unavailable', {
            reason: 'circuit-open',
            error,
          }),
        )
      }

      return Result.err(AppErrorFactory.fromUnknown(error))
    }
  }

  async login(credentials: Credentials): Promise<Result<Session, AppError>> {
    try {
      this.telemetry.track('auth.login.attempt', { email: credentials.email })

      // Use retry policy to handle transient failures
      const result = await this.executeResilient(() =>
        this.httpClient.request<AuthSessionDto>({
          method: 'POST',
          url: `${this.options.baseUrl}/auth/login`,
          body: credentials,
          responseSchema: authSessionDtoSchema,
        }),
      )

      if (result.isErr) {
        this.telemetry.track('auth.login.error', { kind: result.error.kind })
        return Result.err(result.error)
      }

      const session = mapSessionDtoToDomain(result.value.data)
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
      const result = await this.executeResilient(() =>
        this.httpClient.request<AuthSessionDto | null>({
          method: 'GET',
          url: `${this.options.baseUrl}/auth/session`,
          responseSchema: nullableAuthSessionDtoSchema,
        }),
      )

      if (result.isErr) {
        this.telemetry.track('auth.session.error', { kind: result.error.kind })
        return Result.err(result.error)
      }

      const session = result.value.data ? mapSessionDtoToDomain(result.value.data) : null
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
      const result = await this.executeResilient(() =>
        this.httpClient.request({
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
