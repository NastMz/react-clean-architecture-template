import { useMutation, useQueryClient } from '@tanstack/react-query'

import { logout, sessionQueries } from '@/entities/session'

export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.setQueryData(sessionQueries.currentUser().queryKey, null)
      // Drop every other cached query so no data from this user survives the session.
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== sessionQueries.all()[0],
      })
    },
  })
}
