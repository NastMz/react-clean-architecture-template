/**
 * Error thrown by the API client for non-2xx responses and for payloads that
 * do not match the expected schema.
 */
export class ApiError extends Error {
  readonly status: number
  readonly details: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => (error instanceof Error && error.message ? error.message : fallback)
