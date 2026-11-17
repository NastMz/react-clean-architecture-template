import type { QueryClient } from '@tanstack/react-query'
import { redirect, type RouteObject } from 'react-router'

import { paths, routePatterns } from '@/shared/routes'

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
      { index: true, loader: () => redirect(paths.todos) },
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
            path: paths.todos,
            lazy: async () => {
              const { TodosPage, todosLoader } = await import('@/pages/todos')
              return { Component: TodosPage, loader: todosLoader(queryClient) }
            },
          },
          {
            path: routePatterns.todoDetails,
            lazy: async () => {
              const { TodoDetailsPage, todoDetailsLoader } = await import('@/pages/todo-details')
              return { Component: TodoDetailsPage, loader: todoDetailsLoader(queryClient) }
            },
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
