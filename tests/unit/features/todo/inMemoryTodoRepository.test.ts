import { createInMemoryTodoRepository } from '@features/todo/infra/inMemoryTodoRepository'
import { describe, expect, it } from 'vitest'

describe('InMemoryTodoRepository', () => {
  it('should list existing todos', async () => {
    const repo = createInMemoryTodoRepository()
    const result = await repo.list()

    expect(result.isOk).toBe(true)
    expect(result.value).toHaveLength(2)
    expect(result.value[0].title).toBe('Study Clean Architecture')
  })

  it('should create a new todo', async () => {
    const repo = createInMemoryTodoRepository()
    const result = await repo.create({ title: 'Test new todo' })

    expect(result.isOk).toBe(true)
    expect(result.value.title).toBe('Test new todo')
    expect(result.value.completed).toBe(false)

    const listResult = await repo.list()
    expect(listResult.value).toHaveLength(3)
  })

  it('should toggle todo completed status', async () => {
    const repo = createInMemoryTodoRepository()
    const list = await repo.list()
    const firstTodo = list.value[0]

    const result = await repo.toggle(firstTodo.id)

    expect(result.isOk).toBe(true)
    expect(result.value.completed).toBe(!firstTodo.completed)
  })

  it('should reject invalid todo creation', async () => {
    const repo = createInMemoryTodoRepository()
    const result = await repo.create({ title: '' })

    expect(result.isErr).toBe(true)
    expect(result.error.kind).toBe('Validation')
  })
})
