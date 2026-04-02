import { ProtectedRoute } from '@app/router/ProtectedRoute'
import { ProductsPage } from '@features/products/api'
import {
  createInMemoryProductRepository,
  createProductAdapters,
  createProductUseCases,
  ProductAdaptersProvider,
} from '@features/products/api/composition'

import type { AppFeatureDefinition } from './contracts'

export const productsFeature = {
  createAdapters: ({ queryClient, telemetry }) => {
    const repository = createInMemoryProductRepository()
    const useCases = createProductUseCases(repository, telemetry)

    return createProductAdapters({ useCases, queryClient })
  },
  renderProvider: ({ adapters, children }) => (
    <ProductAdaptersProvider adapters={adapters}>{children}</ProductAdaptersProvider>
  ),
  routes: [{ path: '/products', element: <ProtectedRoute element={<ProductsPage />} /> }],
  entryRoute: { to: '/products' },
  navigation: { label: 'Products', to: '/products' },
} satisfies AppFeatureDefinition<ReturnType<typeof createProductAdapters>>
