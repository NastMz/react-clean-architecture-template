import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'

import { createQueryClient } from '@/app/cache/query-client'
import { createRoutes } from '@/app/routes/routes'

const createTestQueryClient = () => {
  const queryClient = createQueryClient()
  queryClient.setDefaultOptions({
    queries: { ...queryClient.getDefaultOptions().queries, retry: false },
  })
  return queryClient
}

/** Renders the whole app (real routes and loaders) at `path`. */
export const renderApp = (path: string) => {
  const queryClient = createTestQueryClient()
  const router = createMemoryRouter(createRoutes(queryClient), { initialEntries: [path] })
  const user = userEvent.setup()

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { user, router, queryClient }
}

/** Renders a single component that needs TanStack Query (and optionally a router). */
export const renderWithProviders = (ui: ReactElement) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter([{ path: '*', element: ui }])
  const user = userEvent.setup()

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { user, router, queryClient }
}
