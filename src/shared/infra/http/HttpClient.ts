import type { AppError } from '@shared/domain/errors/AppError'
import { AppErrorFactory } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'

/**
 * HTTP method types supported by the client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * HTTP request configuration
 */
export interface HttpRequest {
  method: HttpMethod
  url: string
  headers?: Record<string, string>
  body?: unknown
  /** If true, skips onRequest/onResponse and refreshToken interceptor logic */
  skipInterceptors?: boolean
}

/**
 * HTTP response wrapper
 * @template T - Type of response data
 */
export interface HttpResponse<T> {
  status: number
  data: T
}

/**
 * HTTP Client Port (Interface)
 * Defines the contract for HTTP communication
 * Implementation can be swapped (fetch, axios, etc.)
 */
export interface HttpClient {
  /**
   * Makes an HTTP request
   * @template T - Expected response data type
   * @param request - HTTP request configuration
   * @returns Result containing response or AppError
   */
  request<T>(request: HttpRequest): Promise<Result<HttpResponse<T>, AppError>>
}

/**
 * Configuration options for HTTP client
 */
export interface HttpClientOptions {
  baseUrl?: string
  getAuthToken?: () => string | null
  /** Optional hook to modify the outgoing request before sending */
  onRequest?: (req: HttpRequest) => Promise<HttpRequest> | HttpRequest
  /** Optional hook to observe responses (logging/metrics) */
  onResponse?: (info: { request: HttpRequest; status: number; durationMs: number }) => void
  /** Optional token refresh hook. If 401 is received, this will be called and, if a token is returned, the request will be retried once with the new token. */
  refreshToken?: () => Promise<string | null>
}

/**
 * Creates an HTTP client using the Fetch API
 * Handles authentication, error mapping, and response parsing
 * @param options - Client configuration
 * @returns Configured HttpClient implementation
 */
export const createFetchHttpClient = (options: HttpClientOptions = {}): HttpClient => {
  const baseUrl = options.baseUrl?.replace(/\/$/, '') ?? ''

  return {
    async request<T>({ method, url, headers, body, skipInterceptors }: HttpRequest) {
      // Allow request mutation via interceptor
      const initialRequest: HttpRequest = { method, url, headers, body, skipInterceptors }
      const interceptedRequest = initialRequest.skipInterceptors
        ? initialRequest
        : ((await options.onRequest?.(initialRequest)) ?? initialRequest)

      const attempt = async (authOverride?: string | null) => {
        const controller = new AbortController()
        const authHeader = authOverride ?? options.getAuthToken?.()
        const mergedHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: `Bearer ${authHeader}` } : {}),
          ...interceptedRequest.headers,
        }

        const started = performance.now()
        try {
          const response = await fetch(`${baseUrl}${interceptedRequest.url}`, {
            method: interceptedRequest.method,
            headers: mergedHeaders,
            body: interceptedRequest.body ? JSON.stringify(interceptedRequest.body) : undefined,
            signal: controller.signal,
          })

          const durationMs = performance.now() - started
          if (!interceptedRequest.skipInterceptors) {
            options.onResponse?.({
              request: interceptedRequest,
              status: response.status,
              durationMs,
            })
          }

          const contentType = response.headers.get('content-type')
          const parsed: unknown = contentType?.includes('application/json')
            ? await response.json()
            : await response.text()

          return { response, parsed }
        } finally {
          controller.abort()
        }
      }

      // First attempt
      let first
      try {
        first = await attempt()
      } catch (error) {
        return Result.err(AppErrorFactory.network('Network error', error))
      }

      const { response, parsed } = first
      if (!response.ok) {
        // 401: try refresh and one retry if configured
        if (
          !interceptedRequest.skipInterceptors &&
          response.status === 401 &&
          options.refreshToken
        ) {
          try {
            const newToken = await options.refreshToken()
            if (newToken) {
              let retry
              try {
                retry = await attempt(newToken)
              } catch (error) {
                return Result.err(AppErrorFactory.network('Network error', error))
              }
              if (!retry.response.ok) {
                if (retry.response.status === 401) {
                  return Result.err(AppErrorFactory.unauthorized('Unauthorized'))
                }
                if (retry.response.status === 409) {
                  return Result.err(AppErrorFactory.conflict('Conflict'))
                }
                return Result.err(
                  AppErrorFactory.unknown(`Request failed with status ${retry.response.status}`),
                )
              }
              const contentType = retry.response.headers.get('content-type')
              const parsedRetry: unknown = contentType?.includes('application/json')
                ? await retry.response.json()
                : await retry.response.text()
              return Result.ok({ status: retry.response.status, data: parsedRetry as T })
            }
          } catch {
            // fall-through to unauthorized error mapping
          }
          return Result.err(AppErrorFactory.unauthorized('Unauthorized'))
        }

        if (response.status === 409) {
          return Result.err(AppErrorFactory.conflict('Conflict'))
        }

        return Result.err(AppErrorFactory.unknown(`Request failed with status ${response.status}`))
      }

      return Result.ok({ status: response.status, data: parsed as T })
    },
  }
}
