import { useMutation, useQuery } from '@tanstack/react-query'

import { useProductAdapters } from '../composition/useProductAdapters'

export const useProducts = () => {
  const adapters = useProductAdapters()
  return useQuery(adapters.queries.list())
}

export const useCreateProduct = () => {
  const adapters = useProductAdapters()
  return useMutation(adapters.mutations.create())
}
