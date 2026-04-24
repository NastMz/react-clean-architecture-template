import type { AppError } from '@shared/kernel/AppError'
import type { QueryClient } from '@tanstack/react-query'
import { mutationOptions, queryOptions } from '@tanstack/react-query'

import type { TodoUseCases } from '../application/todoUseCases'
import type { CreateTodoInput, Todo, UpdateTodoInput } from '../domain/Todo'

export const todoQueryKeys = {
  all: ['todo'] as const,
}

export const createTodoAdapters = ({
  useCases,
  queryClient,
}: {
  useCases: TodoUseCases
  queryClient: QueryClient
}) => ({
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
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: todoQueryKeys.all })
        },
      }),
    toggle: () =>
      mutationOptions<Todo, AppError, string>({
        mutationFn: async (id) => (await useCases.toggleTodo(id)).unwrapOrThrow(),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: todoQueryKeys.all })
        },
      }),
    update: () =>
      mutationOptions<Todo, AppError, { id: string; input: UpdateTodoInput }>({
        mutationFn: async ({ id, input }) => (await useCases.updateTodo(id, input)).unwrapOrThrow(),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: todoQueryKeys.all })
        },
      }),
    remove: () =>
      mutationOptions<Todo, AppError, string>({
        mutationFn: async (id) => (await useCases.removeTodo(id)).unwrapOrThrow(),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: todoQueryKeys.all })
        },
      }),
  },
})

export type TodoAdapters = ReturnType<typeof createTodoAdapters>
