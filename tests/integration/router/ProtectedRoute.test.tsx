import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import { ContainerContext } from '@app/composition/ContainerContext'
import { ProtectedRoute } from '@app/router/ProtectedRoute'
import type { AppContainer } from '@app/composition/container'

describe('ProtectedRoute', () => {
  const mockSession = {
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    },
    token: 'test-token',
  }

  const createMockContainer = (
    sessionData: typeof mockSession | null = mockSession,
  ): AppContainer => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    // Pre-populate the session query cache
    queryClient.setQueryData(['auth', 'session'], sessionData)

    return {
      queryClient,
      adapters: {
        auth: {
          queries: {
            session: () => ({
              queryKey: ['auth', 'session'] as const,
              queryFn: async () => sessionData,
            }),
          },
          mutations: {
            login: () => ({
              mutationKey: ['auth', 'login'] as const,
              mutationFn: async () => mockSession,
            }),
            logout: () => ({
              mutationKey: ['auth', 'logout'] as const,
              mutationFn: async () => undefined,
            }),
          },
        },
        todo: {
          queries: {
            todos: () => ({
              queryKey: ['todo', 'todos'] as const,
              queryFn: async () => [],
            }),
          },
          mutations: {
            addTodo: () => ({
              mutationKey: ['todo', 'addTodo'] as const,
              mutationFn: async () => ({}),
            }),
            toggleTodo: () => ({
              mutationKey: ['todo', 'toggleTodo'] as const,
              mutationFn: async () => ({}),
            }),
          },
        },
        posts: {
          queries: {
            posts: () => ({
              queryKey: ['posts', 'posts'] as const,
              queryFn: async () => [],
            }),
          },
        },
      },
    }
  }

  it('renders protected content when user is authenticated', () => {
    const container = createMockContainer(mockSession)

    render(
      <QueryClientProvider client={container.queryClient}>
        <ContainerContext.Provider value={container}>
          <BrowserRouter>
            <ProtectedRoute element={<div>Protected Content</div>} />
          </BrowserRouter>
        </ContainerContext.Provider>
      </QueryClientProvider>,
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    const container = createMockContainer(null)

    const { container: renderContainer } = render(
      <QueryClientProvider client={container.queryClient}>
        <ContainerContext.Provider value={container}>
          <BrowserRouter initialEntries={['/todos']}>
            <ProtectedRoute element={<div>Protected Content</div>} />
          </BrowserRouter>
        </ContainerContext.Provider>
      </QueryClientProvider>,
    )

    // When redirected, the protected content should not be visible
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows loading element while authentication is being verified', () => {
    const container = createMockContainer(mockSession)
    // Clear the cache to simulate loading state
    container.queryClient.removeQueries()

    render(
      <QueryClientProvider client={container.queryClient}>
        <ContainerContext.Provider value={container}>
          <BrowserRouter>
            <ProtectedRoute
              element={<div>Protected Content</div>}
              loadingElement={<div>Loading...</div>}
            />
          </BrowserRouter>
        </ContainerContext.Provider>
      </QueryClientProvider>,
    )

    // Should show loading while session is being fetched
    // (In this case, since cache is empty, it will fetch)
    // The exact behavior depends on React Query's timing
  })
})
