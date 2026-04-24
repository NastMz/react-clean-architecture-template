import type { LoggerPort, TelemetryPort } from '@shared/contracts/TelemetryPort'
import type { AppError } from '@shared/kernel/AppError'
import { AppErrorFactory } from '@shared/kernel/AppError'
import type { Result as ResultType } from '@shared/kernel/Result'
import { Result } from '@shared/kernel/Result'

import type { CreateTodoInput, Todo, UpdateTodoInput } from '../domain/Todo'
import type { TodoRepository } from './ports/TodoRepository'

export interface TodoUseCases {
  listTodos(): Promise<ResultType<Todo[], AppError>>
  createTodo(input: CreateTodoInput): Promise<ResultType<Todo, AppError>>
  toggleTodo(id: string): Promise<ResultType<Todo, AppError>>
  updateTodo(id: string, input: UpdateTodoInput): Promise<ResultType<Todo, AppError>>
  removeTodo(id: string): Promise<ResultType<Todo, AppError>>
}

const normalizeUnexpectedError = (error: unknown) => Result.err(AppErrorFactory.fromUnknown(error))

export const createTodoUseCases = (
  repository: TodoRepository,
  telemetry: TelemetryPort & LoggerPort,
): TodoUseCases => ({
  async listTodos() {
    telemetry.track('todo.list.attempt')

    const result = await repository.list()

    if (result.isErr) {
      telemetry.track('todo.list.error', { kind: result.error.kind })
      return result
    }

    telemetry.track('todo.list.success', { count: result.value.length })
    return result
  },
  async createTodo(input) {
    telemetry.track('todo.create.attempt', { title: input.title })

    const result = await repository.create(input).catch(normalizeUnexpectedError)

    if (result.isErr) {
      telemetry.track('todo.create.error', { kind: result.error.kind })
      return result
    }

    telemetry.track('todo.create.success', { todoId: result.value.id })
    return result
  },
  async toggleTodo(id) {
    telemetry.track('todo.toggle.attempt', { todoId: id })

    const result = await repository.toggle(id).catch(normalizeUnexpectedError)

    if (result.isErr) {
      telemetry.track('todo.toggle.error', { kind: result.error.kind })
      return result
    }

    telemetry.track('todo.toggle.success', {
      todoId: result.value.id,
      completed: result.value.completed,
    })
    return result
  },
  async updateTodo(id, input) {
    telemetry.track('todo.update.attempt', { todoId: id })

    const result = await repository.update(id, input).catch(normalizeUnexpectedError)

    if (result.isErr) {
      telemetry.track('todo.update.error', { kind: result.error.kind })
      return result
    }

    telemetry.track('todo.update.success', { todoId: result.value.id })
    return result
  },
  async removeTodo(id) {
    telemetry.track('todo.remove.attempt', { todoId: id })

    const result = await repository.remove(id).catch(normalizeUnexpectedError)

    if (result.isErr) {
      telemetry.track('todo.remove.error', { kind: result.error.kind })
      return result
    }

    telemetry.track('todo.remove.success', { todoId: result.value.id })
    return result
  },
})
