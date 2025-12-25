import type { AppError } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'

import type { CreateTodoInput, Todo } from '../../domain/Todo'

export interface TodoRepository {
  list(): Promise<Result<Todo[], AppError>>
  create(input: CreateTodoInput): Promise<Result<Todo, AppError>>
  toggle(id: string): Promise<Result<Todo, AppError>>
}
