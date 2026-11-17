import type { QueryClient } from '@tanstack/react-query'
import type { RouteObject } from 'react-router'

import { paths } from '@/shared/routes'

import { AppLayout, PageFallback } from '../layout/AppLayout'
import { RouteErrorBoundary } from './RouteErrorBoundary'

/**
 * Route tree. Pages are lazy-loaded, so each one ships as its own chunk. Pass
 * `queryClient` to page loaders to prefetch their data.
 */
export const createRoutes = (_queryClient: QueryClient): RouteObject[] => [
  {
    path: paths.home,
    Component: AppLayout,
    ErrorBoundary: RouteErrorBoundary,
    HydrateFallback: PageFallback,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/pages/home')).HomePage }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/pages/not-found')).NotFoundPage }),
      },
    ],
  },
]
