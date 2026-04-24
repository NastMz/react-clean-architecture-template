import type { AppError } from '@shared/kernel/AppError'
import { AppErrorFactory } from '@shared/kernel/AppError'
import { Result } from '@shared/kernel/Result'
import { z } from 'zod'

import type { TodoRepository } from '../application/ports/TodoRepository'
import type { CreateTodoInput, Todo, UpdateTodoInput } from '../domain/Todo'

const createTodoSchema = z.object({
  title: z.string().trim().min(2),
})

const updateTodoSchema = z.object({
  title: z.string().trim().min(2),
})

const defaultTodos: Todo[] = [
  { id: 'todo-1', title: 'Review architecture diagrams', completed: false },
  { id: 'todo-2', title: 'Prepare testing checklist', completed: true },
]

const findTodoIndexById = (todos: Todo[], id: string): number => todos.findIndex((todo) => todo.id === id)

const getDuplicateTitleError = ({
  todos,
  title,
  skipId,
}: {
  todos: Todo[]
  title: string
  skipId?: string
}): AppError | null => {
  const normalizedTitle = title.toLowerCase()
  const duplicated = todos.some(
    (todo) => todo.id !== skipId && todo.title.toLowerCase() === normalizedTitle,
  )

  if (duplicated) {
    return AppErrorFactory.conflict('A todo with that title already exists')
  }

  return null
}

export const createInMemoryTodoRepository = (seedTodos: Todo[] = defaultTodos): TodoRepository => {
  let todos = [...seedTodos]

  return {
    list() {
      return Promise.resolve(Result.ok([...todos]))
    },
    create(input: CreateTodoInput) {
      const parsed = createTodoSchema.safeParse(input)

      if (!parsed.success) {
        return Promise.resolve(Result.err(AppErrorFactory.validation('Invalid todo payload')))
      }

      const duplicateTitleError = getDuplicateTitleError({ todos, title: parsed.data.title })

      if (duplicateTitleError) {
        return Promise.resolve(Result.err(duplicateTitleError))
      }

      const todo: Todo = {
        id: crypto.randomUUID(),
        title: parsed.data.title,
        completed: false,
      }

      todos = [...todos, todo]
      return Promise.resolve(Result.ok(todo))
    },
    toggle(id: string) {
      const todoIndex = findTodoIndexById(todos, id)

      if (todoIndex < 0) {
        return Promise.resolve(Result.err(AppErrorFactory.validation('Todo not found')))
      }

      const toggledTodo: Todo = {
        ...todos[todoIndex],
        completed: !todos[todoIndex].completed,
      }

      todos = todos.map((todo) => (todo.id === id ? toggledTodo : todo))
      return Promise.resolve(Result.ok(toggledTodo))
    },
    update(id: string, input: UpdateTodoInput) {
      const todoIndex = findTodoIndexById(todos, id)

      if (todoIndex < 0) {
        return Promise.resolve(Result.err(AppErrorFactory.validation('Todo not found')))
      }

      const parsed = updateTodoSchema.safeParse(input)

      if (!parsed.success) {
        return Promise.resolve(Result.err(AppErrorFactory.validation('Invalid todo payload')))
      }

      const duplicateTitleError = getDuplicateTitleError({
        todos,
        title: parsed.data.title,
        skipId: id,
      })

      if (duplicateTitleError) {
        return Promise.resolve(Result.err(duplicateTitleError))
      }

      const updatedTodo: Todo = {
        ...todos[todoIndex],
        title: parsed.data.title,
      }

      todos = todos.map((todo) => (todo.id === id ? updatedTodo : todo))
      return Promise.resolve(Result.ok(updatedTodo))
    },
    remove(id: string) {
      const todoIndex = findTodoIndexById(todos, id)

      if (todoIndex < 0) {
        return Promise.resolve(Result.err(AppErrorFactory.validation('Todo not found')))
      }

      const [removedTodo] = todos.splice(todoIndex, 1)
      todos = [...todos]

      return Promise.resolve(Result.ok(removedTodo))
    },
  }
}
