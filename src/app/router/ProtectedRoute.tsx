import { useAuth } from '@app/composition/useAuth'
import { Navigate } from 'react-router-dom'

/**
 * Guard component to protect routes based on authentication status
 * If user is not authenticated, redirects to login page
 * Otherwise renders the provided element
 *
 * Shows a loading state while checking authentication status
 *
 * @param element - React element to render if user is authenticated
 * @param fallback - Optional redirect path if not authenticated (default: '/auth')
 * @param loadingElement - Optional element to show while loading (default: null)
 *
 * @example
 * ```tsx
 * // In routes.tsx
 * {
 *   path: '/todos',
 *   element: <ProtectedRoute element={<TodoPage />} />
 * }
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
