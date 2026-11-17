import type { QueryClient } from '@tanstack/react-query'
import type { RouteObject } from 'react-router'

import { paths } from '@/shared/routes'

import { AppLayout, PageFallback } from '../layout/AppLayout'
import { redirectIfAuthenticated, requireSession } from './auth-middleware'
import { RouteErrorBoundary } from './RouteErrorBoundary'

/**
 * Route tree. Pages are lazy-loaded, so each one ships as its own chunk and its
 * data loader starts in parallel with the code download.
 */
export const createRoutes = (queryClient: QueryClient): RouteObject[] => [
  {
    path: paths.home,
    Component: AppLayout,
    ErrorBoundary: RouteErrorBoundary,
    HydrateFallback: PageFallback,
    children: [
      {
        path: paths.login,
        middleware: [redirectIfAuthenticated(queryClient)],
        lazy: async () => ({ Component: (await import('@/pages/login')).LoginPage }),
      },
      {
        middleware: [requireSession(queryClient)],
        ErrorBoundary: RouteErrorBoundary,
        children: [
          {
            index: true,
            lazy: async () => ({ Component: (await import('@/pages/home')).HomePage }),
          },
        ],
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/pages/not-found')).NotFoundPage }),
      },
    ],
  },
]
