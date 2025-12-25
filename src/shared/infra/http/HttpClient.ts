import type { AppError } from '../../domain/errors/AppError'
import { AppErrorFactory } from '../../domain/errors/AppError'
import { Result } from '../../domain/result/Result'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface HttpRequest {
  method: HttpMethod
  url: string
  headers?: Record<string, string>
  body?: unknown
}

export interface HttpResponse<T> {
  status: number
  data: T
}

export interface HttpClient {
  request<T>(request: HttpRequest): Promise<Result<HttpResponse<T>, AppError>>
}

export interface HttpClientOptions {
  baseUrl?: string
  getAuthToken?: () => string | null
}

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
