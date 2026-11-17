import { queryOptions } from '@tanstack/react-query'

import { getCurrentUser } from './sessionApi'

export const sessionQueries = {
  all: () => ['session'] as const,
  currentUser: () =>
    queryOptions({
      queryKey: [...sessionQueries.all(), 'current-user'] as const,
      queryFn: getCurrentUser,
      staleTime: Number.POSITIVE_INFINITY,
    }),
}
