import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'

import { createQueryClient } from '@/app/cache/query-client'
import { createRoutes } from '@/app/routes/routes'
import { authToken } from '@/shared/api'

import { tokenForUser } from '../mocks/db'

const createTestQueryClient = () => {
  const queryClient = createQueryClient()
  queryClient.setDefaultOptions({
    queries: { ...queryClient.getDefaultOptions().queries, retry: false },
  })
  return queryClient
}

/** Signs the seeded demo user in, the same way a successful login would. */
export const signInDemoUser = () => {
  authToken.set(tokenForUser('user-1'))
}

/** Renders the whole app (real routes, middleware and loaders) at `path`. */
export const renderApp = (path: string, { signedIn = false } = {}) => {
  if (signedIn) {
    signInDemoUser()
  }

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
