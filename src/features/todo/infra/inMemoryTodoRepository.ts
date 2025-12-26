import type { TodoRepository } from '@features/todo/application/ports/TodoRepository'
import type { CreateTodoInput, Todo } from '@features/todo/domain/Todo'
import { AppErrorFactory } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'
import { z } from 'zod'

/**
 * Zod schema for validating todo creation input
 */
const createTodoInputSchema = z.object({
  title: z.string().min(1, 'Title required'),
})

/**
 * In-memory implementation of TodoRepository
 * Stores todos in memory without persistence
 * Used for development and testing
 * @returns Implementation of TodoRepository interface
 */
export const createInMemoryTodoRepository = (): TodoRepository => {
  let todos: Todo[] = [
    { id: '1', title: 'Study Clean Architecture', completed: true },
    { id: '2', title: 'Build React template', completed: false },
  ]

  return {
    async list() {
      return Promise.resolve(Result.ok([...todos]))
    },
    async create(input: CreateTodoInput) {
      const parsed = createTodoInputSchema.safeParse(input)
      if (!parsed.success) {
        return Promise.resolve(Result.err(AppErrorFactory.validation('Invalid input')))
      }

      const newTodo: Todo = {
        id: `${Date.now()}`,
        title: parsed.data.title,
        completed: false,
      }

      todos = [...todos, newTodo]
      return Promise.resolve(Result.ok(newTodo))
    },
    async toggle(id: string) {
      const idx = todos.findIndex((todo) => todo.id === id)
      if (idx === -1) {
        return Promise.resolve(Result.err(AppErrorFactory.unknown('Todo not found')))
      }

      const updated = { ...todos[idx], completed: !todos[idx].completed }
      todos = [...todos.slice(0, idx), updated, ...todos.slice(idx + 1)]
      return Promise.resolve(Result.ok(updated))
    },
  }
}
