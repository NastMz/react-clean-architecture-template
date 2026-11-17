import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { DataRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

export interface AppProps {
  queryClient: QueryClient
  router: DataRouter
}

export function App({ queryClient, router }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {import.meta.env.DEV ? <ReactQueryDevtools buttonPosition="bottom-left" /> : null}
    </QueryClientProvider>
  )
}
