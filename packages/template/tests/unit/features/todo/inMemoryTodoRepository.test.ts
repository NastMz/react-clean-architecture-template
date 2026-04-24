import { createInMemoryTodoRepository } from '@features/todo/infra/inMemoryTodoRepository'
import { describe, expect, it } from 'vitest'

describe('createInMemoryTodoRepository', () => {
  it('lists seeded todos by default', async () => {
    const repository = createInMemoryTodoRepository()

    const result = await repository.list()

    expect(result.isOk).toBe(true)
    expect(result.value).toHaveLength(2)
  })

  it('creates a new todo when payload is valid and rejects invalid titles', async () => {
    const repository = createInMemoryTodoRepository([])

    const invalid = await repository.create({ title: 'A' })
    const created = await repository.create({ title: 'Write architecture notes' })

    expect(invalid.isErr).toBe(true)
    expect(invalid.error.kind).toBe('Validation')
    expect(created.isOk).toBe(true)
    expect(created.value.title).toBe('Write architecture notes')
    expect(created.value.completed).toBe(false)
  })

  it('rejects duplicated titles regardless of case', async () => {
    const repository = createInMemoryTodoRepository([])

    await repository.create({ title: 'Write architecture notes' })
    const duplicated = await repository.create({ title: 'write architecture notes' })

    expect(duplicated.isErr).toBe(true)
    expect(duplicated.error.kind).toBe('Conflict')
  })

  it('toggles completion and reports missing todos', async () => {
    const repository = createInMemoryTodoRepository([])
    const created = await repository.create({ title: 'Write architecture notes' })

    if (created.isErr) {
      throw new Error('Expected seeded todo')
    }

    const toggled = await repository.toggle(created.value.id)
    const missing = await repository.toggle('missing-todo')

    expect(toggled.isOk).toBe(true)
    expect(toggled.value.completed).toBe(true)
    expect(missing.isErr).toBe(true)
    expect(missing.error.kind).toBe('Validation')
  })

  it('updates and removes todos while handling missing ids', async () => {
    const repository = createInMemoryTodoRepository([])
    const created = await repository.create({ title: 'Write architecture notes' })

    if (created.isErr) {
      throw new Error('Expected seeded todo')
    }

    const updated = await repository.update(created.value.id, {
      title: 'Write stronger architecture notes',
    })
    const removed = await repository.remove(created.value.id)
    const missingUpdate = await repository.update('missing-todo', { title: 'Nope' })
    const missingRemove = await repository.remove('missing-todo')

    expect(updated.isOk).toBe(true)
    expect(updated.value.title).toBe('Write stronger architecture notes')
    expect(removed.isOk).toBe(true)
    expect(removed.value.id).toBe(created.value.id)
    expect(missingUpdate.isErr).toBe(true)
    expect(missingRemove.isErr).toBe(true)
    expect(missingUpdate.error.kind).toBe('Validation')
    expect(missingRemove.error.kind).toBe('Validation')
  })
})
