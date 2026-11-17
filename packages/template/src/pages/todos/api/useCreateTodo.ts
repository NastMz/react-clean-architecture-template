import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createTodo, todoQueries } from '@/entities/todo'

export const useCreateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todoQueries.list().queryKey }),
  })
}
