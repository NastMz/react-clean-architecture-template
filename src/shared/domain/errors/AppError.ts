export type AppErrorKind = 'Validation' | 'Unauthorized' | 'Network' | 'Conflict' | 'Unknown'

export interface AppError {
  kind: AppErrorKind
  message: string
  cause?: unknown
}

const createError =
  (kind: AppErrorKind) =>
  (message: string, cause?: unknown): AppError => ({
    kind,
    message,
    cause,
  })

export const AppErrorFactory = {
  validation: createError('Validation'),
  unauthorized: createError('Unauthorized'),
  network: createError('Network'),
  conflict: createError('Conflict'),
  unknown: createError('Unknown'),
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

export const formatAppError = (error: AppError): string => {
  const label = error.kind === 'Validation' ? 'Validation' : error.kind
  return `${label}: ${error.message}`
}
