import { useSession } from '@features/auth/adapters/authAdapters'

/**
 * Hook to access authentication state throughout the application
 * Returns the current session with convenient authentication helpers
 *
 * @returns Object with:
 *   - session: Current authenticated session (user + token) or null if not authenticated
 *   - isAuthenticated: Whether a user is currently logged in
 *   - isLoading: Whether session is being fetched
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
  // Use the exported hook from adapters instead of accessing container directly
  const sessionQuery = useSession()

  return {
    session: sessionQuery.data ?? null,
    isAuthenticated: !!sessionQuery.data,
    isLoading: sessionQuery.isLoading,
  }
}
