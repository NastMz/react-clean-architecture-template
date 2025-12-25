import { AppErrorFactory } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'
import { z } from 'zod'

import type { TodoRepository } from '../application/ports/TodoRepository'
import type { CreateTodoInput, Todo } from '../domain/Todo'

const createTodoInputSchema = z.object({
  title: z.string().min(1, 'Title required'),
})

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
