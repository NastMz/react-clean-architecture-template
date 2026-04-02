import type { ProductUseCases } from '@features/products/application/productUseCases'
import type { CreateProductInput, Product } from '@features/products/domain/Product'
import type { AppError } from '@shared/kernel/AppError'
import type { QueryClient } from '@tanstack/react-query'
import { mutationOptions, queryOptions } from '@tanstack/react-query'

export const productQueryKeys = {
  all: ['products'] as const,
}

export const createProductAdapters = ({
  useCases,
  queryClient,
}: {
  useCases: ProductUseCases
  queryClient: QueryClient
}) => ({
  queries: {
    list: () =>
      queryOptions<Product[], AppError>({
        queryKey: productQueryKeys.all,
        queryFn: async () => (await useCases.listProducts()).unwrapOrThrow(),
      }),
  },
  mutations: {
    create: () =>
      mutationOptions<Product, AppError, CreateProductInput>({
        mutationFn: async (input) => (await useCases.createProduct(input)).unwrapOrThrow(),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: productQueryKeys.all })
        },
      }),
  },
})

export type ProductAdapters = ReturnType<typeof createProductAdapters>
