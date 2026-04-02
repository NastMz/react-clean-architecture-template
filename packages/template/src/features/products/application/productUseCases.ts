import type { ProductRepository } from '@features/products/application/ports/ProductRepository'
import type { CreateProductInput, Product } from '@features/products/domain/Product'
import type { LoggerPort, TelemetryPort } from '@shared/contracts/TelemetryPort'
import type { AppError } from '@shared/kernel/AppError'
import { AppErrorFactory } from '@shared/kernel/AppError'
import type { Result as ResultType } from '@shared/kernel/Result'
import { Result } from '@shared/kernel/Result'

export interface ProductUseCases {
  listProducts(): Promise<ResultType<Product[], AppError>>
  createProduct(input: CreateProductInput): Promise<ResultType<Product, AppError>>
}

export const createProductUseCases = (
  repository: ProductRepository,
  telemetry: TelemetryPort & LoggerPort,
): ProductUseCases => ({
  async listProducts() {
    telemetry.track('products.list.attempt')

    const result = await repository.list()

    if (result.isErr) {
      telemetry.track('products.list.error', { kind: result.error.kind })
      return result
    }

    telemetry.track('products.list.success', { count: result.value.length })
    return result
  },
  async createProduct(input) {
    telemetry.track('products.create.attempt', { name: input.name })

    const result = await repository
      .create(input)
      .catch((error: unknown) => Result.err(AppErrorFactory.fromUnknown(error)))

    if (result.isErr) {
      telemetry.track('products.create.error', { kind: result.error.kind })
      return result
    }

    telemetry.track('products.create.success', { productId: result.value.id })
    return result
  },
})
