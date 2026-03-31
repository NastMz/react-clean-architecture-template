import { useMutation, useQuery } from '@tanstack/react-query'

import { useAuthAdapters } from '../composition/useAuthAdapters'

export const useSession = () => {
  const adapters = useAuthAdapters()
  return useQuery(adapters.queries.session())
}

export const useLogin = () => {
  const adapters = useAuthAdapters()
  return useMutation(adapters.mutations.login())
}

export const useLogout = () => {
  const adapters = useAuthAdapters()
  return useMutation(adapters.mutations.logout())
}
