import type { LoggerPort, TelemetryPort } from '@shared/application/ports/TelemetryPort'
import type { AppError } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'

import type { CreateTodoInput, Todo } from '../domain/Todo'
import type { TodoRepository } from './ports/TodoRepository'

/**
 * Todo Use Cases Interface
 * Defines all business logic operations for todo management
 */
export interface TodoUseCases {
  /**
   * Retrieves all todos for the current user
   * @returns Result containing array of todos or AppError
   */
  listTodos(): Promise<Result<Todo[], AppError>>

  /**
   * Creates a new todo item
   * @param input - Todo creation data
   * @returns Result containing created Todo or AppError
   */
  createTodo(input: CreateTodoInput): Promise<Result<Todo, AppError>>

  /**
   * Toggles the completion status of a todo
   * @param id - The ID of the todo to toggle
   * @returns Result containing updated Todo or AppError
   */
  toggleTodo(id: string): Promise<Result<Todo, AppError>>
}

/**
 * Creates todo use cases with injected dependencies
 * Implements telemetry tracking for all todo operations
 * @param repository - Todo repository for persistence operations
 * @param telemetry - Telemetry service for tracking events
 * @returns Implementation of TodoUseCases
 */
export const createTodoUseCases = (
  repository: TodoRepository,
  telemetry: TelemetryPort & LoggerPort,
): TodoUseCases => ({
  async listTodos() {
    telemetry.track('todo.list')
    const result = await repository.list()
    result.match({
      ok: (todos) => telemetry.info(`Loaded ${todos.length} todos`),
      err: (error) => telemetry.error('Failed to load todos', { kind: error.kind }),
    })
    return result
  },
  async createTodo(input) {
    telemetry.track('todo.create', { title: input.title })
    const result = await repository.create(input)
    result.match({
      ok: (todo) => telemetry.track('todo.create.success', { id: todo.id }),
      err: (error) => telemetry.track('todo.create.error', { kind: error.kind }),
    })
    return result
  },
  async toggleTodo(id) {
    telemetry.track('todo.toggle', { id })
    const result = await repository.toggle(id)
    result.match({
      ok: (todo) =>
        telemetry.track('todo.toggle.success', { id: todo.id, completed: todo.completed }),
      err: (error) => telemetry.track('todo.toggle.error', { kind: error.kind }),
    })
    return result
  },
})
