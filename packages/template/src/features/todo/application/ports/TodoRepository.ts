import type { AppError } from '@shared/kernel/AppError'
import type { Result } from '@shared/kernel/Result'

import type { CreateTodoInput, Todo, UpdateTodoInput } from '../../domain/Todo'

export interface TodoRepository {
  list(): Promise<Result<Todo[], AppError>>
  create(input: CreateTodoInput): Promise<Result<Todo, AppError>>
  toggle(id: string): Promise<Result<Todo, AppError>>
  update(id: string, input: UpdateTodoInput): Promise<Result<Todo, AppError>>
  remove(id: string): Promise<Result<Todo, AppError>>
}
