import { useMutation, useQueryClient } from '@tanstack/react-query'

import { type Todo, todoQueries, updateTodo } from '@/entities/todo'

export const useToggleTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (todo: Todo) => updateTodo(todo.id, { completed: !todo.completed }),
    onSuccess: (updated) => {
      queryClient.setQueryData(todoQueries.detail(updated.id).queryKey, updated)
      return queryClient.invalidateQueries({ queryKey: todoQueries.list().queryKey })
    },
  })
}
