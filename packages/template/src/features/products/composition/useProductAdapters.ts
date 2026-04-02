import { useContext } from 'react'

import { ProductAdaptersContext } from './ProductAdaptersContext'

export const useProductAdapters = () => {
  const adapters = useContext(ProductAdaptersContext)

  if (!adapters) {
    throw new Error('useProductAdapters must be used within ProductAdaptersProvider')
  }

  return adapters
}
