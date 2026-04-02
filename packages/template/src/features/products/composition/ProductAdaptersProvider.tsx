import type { ReactNode } from 'react'

import type { ProductAdapters } from '../adapters/productAdapters'
import { ProductAdaptersContext } from './ProductAdaptersContext'

export const ProductAdaptersProvider = ({
  adapters,
  children,
}: {
  adapters: ProductAdapters
  children: ReactNode
}) => <ProductAdaptersContext.Provider value={adapters}>{children}</ProductAdaptersContext.Provider>
