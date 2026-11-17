import { QueryClient } from '@tanstack/react-query'

import { isApiError } from '@/shared/api'

const MAX_RETRIES = 2

/** Client errors (4xx) are deterministic, so retrying them only delays the UI. */
const shouldRetry = (failureCount: number, error: unknown) =>
  !(isApiError(error) && error.status >= 400 && error.status < 500) && failureCount < MAX_RETRIES

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
      },
      mutations: {
        retry: false,
      },
    },
  })
