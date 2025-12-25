/**
 * Error kind categories for typed error handling
 * Helps determine appropriate error handling strategies
 */
export type AppErrorKind = 'Validation' | 'Unauthorized' | 'Network' | 'Conflict' | 'Unknown'

/**
 * Structured application error object
 * Provides consistent error representation throughout the app
 */
export interface AppError {
  kind: AppErrorKind
  message: string
  cause?: unknown
}

/**
 * Creates an error with a specific kind
 * @param kind - Category of the error
 * @returns Function that creates AppError instances with the specified kind
 */
const createError =
  (kind: AppErrorKind) =>
  (message: string, cause?: unknown): AppError => ({
    kind,
    message,
    cause,
  })

/**
 * Factory for creating typed AppError instances
 * Provides convenient methods for common error scenarios
 */
export const AppErrorFactory = {
  validation: createError('Validation'),
  unauthorized: createError('Unauthorized'),
  network: createError('Network'),
  conflict: createError('Conflict'),
  unknown: createError('Unknown'),

  /**
   * Converts unknown error types to AppError
   * Handles plain errors, Error objects, and AppError instances
   * @param error - Any error object to convert
   * @returns Properly typed AppError instance
   */
  fromUnknown(error: unknown): AppError {
    if (error && typeof error === 'object' && 'kind' in error && 'message' in error) {
      return error as AppError
    }

    if (error instanceof Error) {
      return createError('Unknown')(error.message, error)
    }

    return createError('Unknown')('Unexpected error', error)
  },
}

/**
 * Formats an AppError for display to users
 * @param error - The error to format
 * @returns Human-readable error message
 */
export const formatAppError = (error: AppError): string => {
  const label = error.kind === 'Validation' ? 'Validation' : error.kind
  return `${label}: ${error.message}`
}
