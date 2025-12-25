import type { AppError } from '@shared/domain/errors/AppError'
import type { QueryClient } from '@tanstack/react-query'
import { mutationOptions, queryOptions } from '@tanstack/react-query'

import type { TodoUseCases } from '../application/todoUseCases'
import type { CreateTodoInput, Todo } from '../domain/Todo'

/**
 * Query keys for todo-related React Query operations
 * Ensures consistent cache invalidation and query identification
 */
export const todoQueryKeys = {
  all: ['todos'] as const,
}

/**
 * Todo Adapters Factory
 * Bridges todo use cases with React Query
 * Creates reusable query and mutation options
 * @param useCases - Todo business logic
 * @param queryClient - React Query client for cache management
 * @returns Object containing query and mutation configurations
 */
export const createTodoAdapters = ({
  useCases,
  queryClient,
}: {
  useCases: TodoUseCases
  queryClient: QueryClient
}) => {
  return {
    queries: {
      list: () =>
        queryOptions<Todo[], AppError>({
          queryKey: todoQueryKeys.all,
          queryFn: async () => (await useCases.listTodos()).unwrapOrThrow(),
        }),
    },
    mutations: {
      create: () =>
        mutationOptions<Todo, AppError, CreateTodoInput>({
          mutationFn: async (input) => (await useCases.createTodo(input)).unwrapOrThrow(),
          onSuccess: () => queryClient.invalidateQueries({ queryKey: todoQueryKeys.all }),
        }),
      toggle: () =>
        mutationOptions<Todo, AppError, string>({
          mutationFn: async (id) => (await useCases.toggleTodo(id)).unwrapOrThrow(),
          onSuccess: () => queryClient.invalidateQueries({ queryKey: todoQueryKeys.all }),
        }),
    },
  }
}

export type TodoAdapters = ReturnType<typeof createTodoAdapters>
