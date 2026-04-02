import { createProductUseCases } from '@features/products/application/productUseCases'
import type { ProductRepository } from '@features/products/application/ports/ProductRepository'
import type { CreateProductInput, Product } from '@features/products/domain/Product'
import type { LoggerPort, TelemetryPort } from '@shared/contracts/TelemetryPort'
import { AppErrorFactory } from '@shared/kernel/AppError'
import { Result } from '@shared/kernel/Result'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('createProductUseCases', () => {
  const telemetry: TelemetryPort & LoggerPort = {
    track: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }

  const product: Product = {
    id: 'product-1',
    name: 'Architecture coaching',
    price: 150,
  }

  const input: CreateProductInput = {
    name: 'Architecture coaching',
    price: 150,
  }

  const repository: ProductRepository = {
    list: vi.fn(),
    create: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('tracks list attempt and success', async () => {
    vi.mocked(repository.list).mockResolvedValue(Result.ok([product]))
    const useCases = createProductUseCases(repository, telemetry)

    const result = await useCases.listProducts()

    expect(result.isOk).toBe(true)
    expect(telemetry.track).toHaveBeenNthCalledWith(1, 'products.list.attempt')
    expect(telemetry.track).toHaveBeenNthCalledWith(2, 'products.list.success', { count: 1 })
  })

  it('tracks create errors returned by the repository', async () => {
    const error = AppErrorFactory.conflict('duplicate')
    vi.mocked(repository.create).mockResolvedValue(Result.err(error))
    const useCases = createProductUseCases(repository, telemetry)

    const result = await useCases.createProduct(input)

    expect(result.isErr).toBe(true)
    expect(result.error).toEqual(error)
    expect(telemetry.track).toHaveBeenNthCalledWith(1, 'products.create.attempt', {
      name: input.name,
    })
    expect(telemetry.track).toHaveBeenNthCalledWith(2, 'products.create.error', {
      kind: 'Conflict',
    })
  })

  it('normalizes thrown create errors into unknown app errors', async () => {
    vi.mocked(repository.create).mockRejectedValue(new Error('repository exploded'))
    const useCases = createProductUseCases(repository, telemetry)

    const result = await useCases.createProduct(input)

    expect(result.isErr).toBe(true)
    expect(result.error.kind).toBe('Unknown')
    expect(result.error.message).toBe('repository exploded')
  })
})
