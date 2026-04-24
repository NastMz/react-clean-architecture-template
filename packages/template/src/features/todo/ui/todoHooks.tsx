import { useMutation, useQuery } from '@tanstack/react-query'

import { useTodoAdapters } from '../composition/useTodoAdapters'

export const useTodos = () => {
  const adapters = useTodoAdapters()
  return useQuery(adapters.queries.list())
}

export const useCreateTodo = () => {
  const adapters = useTodoAdapters()
  return useMutation(adapters.mutations.create())
}

export const useToggleTodo = () => {
  const adapters = useTodoAdapters()
  return useMutation(adapters.mutations.toggle())
}

export const useUpdateTodo = () => {
  const adapters = useTodoAdapters()
  return useMutation(adapters.mutations.update())
}

export const useRemoveTodo = () => {
  const adapters = useTodoAdapters()
  return useMutation(adapters.mutations.remove())
}
