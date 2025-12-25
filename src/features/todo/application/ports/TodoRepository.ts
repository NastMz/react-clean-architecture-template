import type { AppError } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'

import type { CreateTodoInput, Todo } from '../../domain/Todo'

/**
 * Todo Repository Port (Interface)
 * Defines the contract for todo persistence operations
 * Implementation details are hidden behind this interface
 */
export interface TodoRepository {
  /**
   * Retrieves all todo items
   * @returns Result containing array of todos or AppError
   */
  list(): Promise<Result<Todo[], AppError>>

  /**
   * Creates a new todo item
   * @param input - Data for creating the todo
   * @returns Result containing created Todo or AppError
   */
  create(input: CreateTodoInput): Promise<Result<Todo, AppError>>

  /**
   * Toggles the completed status of a todo
   * @param id - The ID of the todo to toggle
   * @returns Result containing updated Todo or AppError
   */
  toggle(id: string): Promise<Result<Todo, AppError>>
}
