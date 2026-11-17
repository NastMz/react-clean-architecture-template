import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import { createQueryClient } from '../cache/query-client'
import { createRoutes } from '../routes/routes'

const queryClient = createQueryClient()
const router = createBrowserRouter(createRoutes(queryClient))

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {import.meta.env.DEV ? <ReactQueryDevtools buttonPosition="bottom-left" /> : null}
    </QueryClientProvider>
  )
}
