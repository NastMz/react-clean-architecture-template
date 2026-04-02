import type { CreateProductInput, Product } from '@features/products/domain/Product'
import type { AppError } from '@shared/kernel/AppError'
import type { Result } from '@shared/kernel/Result'

export interface ProductRepository {
  list(): Promise<Result<Product[], AppError>>
  create(input: CreateProductInput): Promise<Result<Product, AppError>>
}
