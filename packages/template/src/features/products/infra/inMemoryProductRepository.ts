import type { ProductRepository } from '@features/products/application/ports/ProductRepository'
import type { CreateProductInput, Product } from '@features/products/domain/Product'
import { AppErrorFactory } from '@shared/kernel/AppError'
import { Result } from '@shared/kernel/Result'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().trim().min(2),
  price: z.number().finite().positive(),
})

const defaultProducts: Product[] = [
  { id: 'product-1', name: 'Architecture review', price: 120 },
  { id: 'product-2', name: 'Testing workshop', price: 80 },
]

export const createInMemoryProductRepository = (
  seedProducts: Product[] = defaultProducts,
): ProductRepository => {
  let products = [...seedProducts]

  return {
    list() {
      return Promise.resolve(Result.ok([...products]))
    },
    create(input: CreateProductInput) {
      const parsed = createProductSchema.safeParse(input)

      if (!parsed.success) {
        return Promise.resolve(Result.err(AppErrorFactory.validation('Invalid product payload')))
      }

      const normalizedName = parsed.data.name.toLowerCase()
      const duplicated = products.some((product) => product.name.toLowerCase() === normalizedName)

      if (duplicated) {
        return Promise.resolve(
          Result.err(AppErrorFactory.conflict('A product with that name already exists')),
        )
      }

      const product: Product = {
        id: crypto.randomUUID(),
        name: parsed.data.name,
        price: parsed.data.price,
      }

      products = [...products, product]
      return Promise.resolve(Result.ok(product))
    },
  }
}
