import { useMutation, useQueryClient } from '@tanstack/react-query'

import { login, sessionQueries } from '@/entities/session'

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(sessionQueries.currentUser().queryKey, user)
    },
  })
}
