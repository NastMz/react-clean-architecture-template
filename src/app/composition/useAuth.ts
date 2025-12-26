import { useQuery } from '@tanstack/react-query'
import { useContext } from 'react'

import { ContainerContext } from './ContainerContext'

/**
 * Hook to access authentication state throughout the application
 * Returns the current session from the auth adapter
 * Throws if used outside of container provider context
 *
 * @returns Object with:
 *   - session: Current authenticated session (user + token) or null if not authenticated
 *   - isAuthenticated: Whether a user is currently logged in
 *   - isLoading: Whether session is being fetched
 *
 * @throws If used without ContainerProvider wrapper
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { session, isAuthenticated } = useAuth()
 *   if (!isAuthenticated) return <LoginPrompt />
 *   return <h1>Welcome {session?.user.name}</h1>
 * }
 * ```
 */
export const useAuth = () => {
  const container = useContext(ContainerContext)

  if (!container) {
    throw new Error('useAuth must be used within ContainerProvider')
  }

  // Query current session from auth adapter
  const sessionQuery = useQuery(container.adapters.auth.queries.session())

  return {
    session: sessionQuery.data ?? null,
    isAuthenticated: !!sessionQuery.data,
    isLoading: sessionQuery.isLoading,
  }
}
