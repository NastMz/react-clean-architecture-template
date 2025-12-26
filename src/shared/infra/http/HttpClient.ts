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
    async request<T>({ method, url, headers, body }: HttpRequest) {
      const controller = new AbortController()
      const authHeader = options.getAuthToken?.()
      const mergedHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: `Bearer ${authHeader}` } : {}),
        ...headers,
      }

      try {
        const response = await fetch(`${baseUrl}${url}`, {
          method,
          headers: mergedHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        })

        const contentType = response.headers.get('content-type')
        const parsed: unknown = contentType?.includes('application/json')
          ? await response.json()
          : await response.text()

        if (!response.ok) {
          if (response.status === 401) {
            return Result.err(AppErrorFactory.unauthorized('Unauthorized'))
          }

          if (response.status === 409) {
            return Result.err(AppErrorFactory.conflict('Conflict'))
          }

          return Result.err(
            AppErrorFactory.unknown(`Request failed with status ${response.status}`),
          )
        }

        return Result.ok({ status: response.status, data: parsed as T })
      } catch (error) {
        return Result.err(AppErrorFactory.network('Network error', error))
      } finally {
        controller.abort()
      }
    },
  }
}
