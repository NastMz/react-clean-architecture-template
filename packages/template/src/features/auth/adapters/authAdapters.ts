import type { AuthUseCases } from '@features/auth/application/authUseCases'
import type { Credentials, Session } from '@features/auth/domain/User'
import type { AppError } from '@shared/domain/errors/AppError'
import type { QueryClient } from '@tanstack/react-query'
import { mutationOptions, queryOptions } from '@tanstack/react-query'

/**
 * Query keys for auth-related React Query operations
 * Ensures consistent cache invalidation and query identification
 */
export const authQueryKeys = {
  session: ['auth', 'session'] as const,
}

/**
 * Authentication Adapters Factory
 * Bridges authentication use cases with React Query
 * Creates reusable query and mutation options
 * @param useCases - Authentication business logic
 * @param queryClient - React Query client for cache management
 * @returns Object containing query and mutation configurations
 */
export const createAuthAdapters = ({
  useCases,
  queryClient,
}: {
  useCases: AuthUseCases
  queryClient: QueryClient
}) => {
  return {
    queries: {
      session: () =>
        queryOptions<Session | null, AppError>({
          queryKey: authQueryKeys.session,
          queryFn: async () => (await useCases.currentSession()).unwrapOrThrow(),
        }),
    },
    mutations: {
      login: () =>
        mutationOptions<Session, AppError, Credentials>({
          mutationFn: async (input) => (await useCases.login(input)).unwrapOrThrow(),
          onSuccess: (session) => {
            queryClient.setQueryData(authQueryKeys.session, session)
          },
        }),
      logout: () =>
        mutationOptions<void, AppError, void>({
          mutationFn: async () => (await useCases.logout()).unwrapOrThrow(),
          onSuccess: () => {
            queryClient.setQueryData(authQueryKeys.session, null)
          },
        }),
    },
  }
}

export type AuthAdapters = ReturnType<typeof createAuthAdapters>
