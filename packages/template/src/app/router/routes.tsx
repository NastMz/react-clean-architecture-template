import {
  getAppDefaultRoute,
  getAppFeatureNavigation,
  getAppFeatureRoutes,
} from '@app/extensions/registry'
import { RootLayout } from '@shared/ui/RootLayout'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

/**
 * Application router configuration
 * Minimal clean architecture example:
 * - / : Root layout wrapper
 *   - /auth : Public login/logout page
 *
 * To add new features: create new routes and wrap with <ProtectedRoute> if needed
 * See docs/feature-playbook.md for pattern
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout navigationItems={getAppFeatureNavigation()} />,
    children: [{ index: true, element: <Navigate to={getAppDefaultRoute()} replace /> }, ...getAppFeatureRoutes()],
  },
])

/**
 * Router provider component
 * Sets up React Router for application navigation
 */
export const AppRouter = () => <RouterProvider router={router} />
