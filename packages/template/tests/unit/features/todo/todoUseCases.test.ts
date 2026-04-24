import { createTodoUseCases } from '@features/todo/application/todoUseCases'
import type { TodoRepository } from '@features/todo/application/ports/TodoRepository'
import type { CreateTodoInput, Todo, UpdateTodoInput } from '@features/todo/domain/Todo'
import type { LoggerPort, TelemetryPort } from '@shared/contracts/TelemetryPort'
import { AppErrorFactory } from '@shared/kernel/AppError'
import { Result } from '@shared/kernel/Result'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('createTodoUseCases', () => {
  const telemetry: TelemetryPort & LoggerPort = {
    track: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }

  const todo: Todo = {
    id: 'todo-1',
    title: 'Write architecture notes',
    completed: false,
  }

  const createInput: CreateTodoInput = {
    title: 'Write architecture notes',
  }

  const updateInput: UpdateTodoInput = {
    title: 'Write stronger architecture notes',
  }

  const repository: TodoRepository = {
    list: vi.fn(),
    create: vi.fn(),
    toggle: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('tracks list attempt and success', async () => {
    vi.mocked(repository.list).mockResolvedValue(Result.ok([todo]))
    const useCases = createTodoUseCases(repository, telemetry)

    const result = await useCases.listTodos()

    expect(result.isOk).toBe(true)
    expect(telemetry.track).toHaveBeenNthCalledWith(1, 'todo.list.attempt')
    expect(telemetry.track).toHaveBeenNthCalledWith(2, 'todo.list.success', { count: 1 })
  })

  it('tracks create/toggle/update/remove errors returned by the repository', async () => {
    const conflict = AppErrorFactory.conflict('duplicate')
    const missing = AppErrorFactory.validation('todo not found')

    vi.mocked(repository.create).mockResolvedValue(Result.err(conflict))
    vi.mocked(repository.toggle).mockResolvedValue(Result.err(missing))
    vi.mocked(repository.update).mockResolvedValue(Result.err(missing))
    vi.mocked(repository.remove).mockResolvedValue(Result.err(missing))

    const useCases = createTodoUseCases(repository, telemetry)

    const createResult = await useCases.createTodo(createInput)
    const toggleResult = await useCases.toggleTodo(todo.id)
    const updateResult = await useCases.updateTodo(todo.id, updateInput)
    const removeResult = await useCases.removeTodo(todo.id)

    expect(createResult.isErr).toBe(true)
    expect(toggleResult.isErr).toBe(true)
    expect(updateResult.isErr).toBe(true)
    expect(removeResult.isErr).toBe(true)
    expect(telemetry.track).toHaveBeenCalledWith('todo.create.error', { kind: 'Conflict' })
    expect(telemetry.track).toHaveBeenCalledWith('todo.toggle.error', { kind: 'Validation' })
    expect(telemetry.track).toHaveBeenCalledWith('todo.update.error', { kind: 'Validation' })
    expect(telemetry.track).toHaveBeenCalledWith('todo.remove.error', { kind: 'Validation' })
  })

  it('normalizes thrown errors into unknown app errors', async () => {
    vi.mocked(repository.create).mockRejectedValue(new Error('repository exploded'))
    const useCases = createTodoUseCases(repository, telemetry)

    const result = await useCases.createTodo(createInput)

    expect(result.isErr).toBe(true)
    expect(result.error.kind).toBe('Unknown')
    expect(result.error.message).toBe('repository exploded')
  })
})
