import { createContext } from 'react'

import type { ProductAdapters } from '../adapters/productAdapters'

export const ProductAdaptersContext = createContext<ProductAdapters | null>(null)
