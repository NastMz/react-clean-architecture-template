import { ProtectedRoute } from '@app/router/ProtectedRoute'
import { TodoPage } from '@features/todo/api'
import {
  createInMemoryTodoRepository,
  createTodoAdapters,
  createTodoUseCases,
  TodoAdaptersProvider,
} from '@features/todo/api/composition'

import { defineAppFeature } from './contracts'

export const todoFeature = defineAppFeature({
  createAdapters: ({ queryClient, telemetry }) => {
    const repository = createInMemoryTodoRepository()
    const useCases = createTodoUseCases(repository, telemetry)

    return createTodoAdapters({ useCases, queryClient })
  },
  renderProvider: ({ adapters, children }) => (
    <TodoAdaptersProvider adapters={adapters}>{children}</TodoAdaptersProvider>
  ),
  routes: [{ path: '/todo', element: <ProtectedRoute element={<TodoPage />} /> }],
  entryRoute: { to: '/todo' },
  navigation: { label: 'Todo', to: '/todo' },
})
