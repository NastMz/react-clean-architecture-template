import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteTodo, todoQueries, updateTodo } from '@/entities/todo'

export const useRenameTodo = (todoId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (title: string) => updateTodo(todoId, { title }),
    onSuccess: (updated) => {
      queryClient.setQueryData(todoQueries.detail(todoId).queryKey, updated)
      return queryClient.invalidateQueries({ queryKey: todoQueries.list().queryKey })
    },
  })
}

export const useDeleteTodo = (todoId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteTodo(todoId),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: todoQueries.list().queryKey })
    },
  })
}
