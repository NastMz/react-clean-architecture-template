import {
  getAppDefaultRoute,
  getAppFeatureNavigation,
  getAppFeatureRoutes,
} from '@app/extensions/registry'
import { RootLayout } from '@shared/ui/RootLayout'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

/**
 * Application router configuration
 * All feature routes/navigation/default route are consumed from
 * `src/app/extensions/registry.tsx`.
 *
 * Integration rule:
 * - add/modify feature wiring in `src/app/extensions/<feature>.tsx`
 * - do not hardcode feature routes in this module
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout navigationItems={getAppFeatureNavigation()} />,
    children: [
      { index: true, element: <Navigate to={getAppDefaultRoute()} replace /> },
      ...getAppFeatureRoutes(),
    ],
  },
])

/**
 * Router provider component
 * Sets up React Router for application navigation
 */
export const AppRouter = () => <RouterProvider router={router} />
