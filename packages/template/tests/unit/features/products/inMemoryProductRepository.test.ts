import { createInMemoryProductRepository } from '@features/products/infra/inMemoryProductRepository'
import { describe, expect, it } from 'vitest'

describe('createInMemoryProductRepository', () => {
  it('lists seeded products by default', async () => {
    const repository = createInMemoryProductRepository()

    const result = await repository.list()

    expect(result.isOk).toBe(true)
    expect(result.value).toHaveLength(2)
  })

  it('creates a new product when the payload is valid', async () => {
    const repository = createInMemoryProductRepository([])

    const result = await repository.create({ name: 'Architecture coaching', price: 150 })

    expect(result.isOk).toBe(true)
    expect(result.value.name).toBe('Architecture coaching')
  })

  it('rejects invalid payloads and duplicated names', async () => {
    const repository = createInMemoryProductRepository([])

    const invalid = await repository.create({ name: 'A', price: 0 })
    const created = await repository.create({ name: 'Architecture coaching', price: 150 })
    const duplicated = await repository.create({ name: 'architecture coaching', price: 200 })

    expect(invalid.isErr).toBe(true)
    expect(invalid.error.kind).toBe('Validation')
    expect(created.isOk).toBe(true)
    expect(duplicated.isErr).toBe(true)
    expect(duplicated.error.kind).toBe('Conflict')
  })
})
