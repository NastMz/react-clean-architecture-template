import { useAuth } from '@app/composition/useAuth'
import { Navigate } from 'react-router-dom'

/**
 * Guard component to protect routes based on authentication status
 * Used by feature manifests (for example `todo`) to keep route protection
 * as a cross-cutting concern owned by auth/session state.
 *
 * Shows a loading state while checking authentication status
 *
 * @param element - React element to render if user is authenticated
 * @param fallback - Optional redirect path if not authenticated (default: '/auth')
 * @param loadingElement - Optional element to show while loading (default: null)
 *
 * @example
 * ```tsx
 * // In src/app/extensions/todo.tsx
 * routes: [{ path: '/todo', element: <ProtectedRoute element={<TodoPage />} /> }]
 * ```
 */
export const ProtectedRoute = ({
  element,
  fallback = '/auth',
  loadingElement,
}: {
  element: React.ReactElement
  fallback?: string
  loadingElement?: React.ReactElement
}) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return loadingElement ?? null
  }

  if (!isAuthenticated) {
    return <Navigate to={fallback} replace />
  }

  return element
}
