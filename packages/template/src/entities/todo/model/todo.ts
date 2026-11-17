import { z } from 'zod'

export const TODO_TITLE_MAX_LENGTH = 120

/** Business rule for a todo title, shared by forms and API payloads. */
export const todoTitleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(TODO_TITLE_MAX_LENGTH, `Title must be ${TODO_TITLE_MAX_LENGTH} characters or fewer`)

export const todoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.iso.datetime(),
})

export type Todo = z.infer<typeof todoSchema>

export const newTodoSchema = z.object({ title: todoTitleSchema })

export type NewTodo = z.infer<typeof newTodoSchema>

export interface TodoChanges {
  title?: string
  completed?: boolean
}
