import { z } from 'zod'

import { apiClient } from '@/shared/api'

import { type NewTodo, type Todo, type TodoChanges, todoSchema } from '../model/todo'

const todoPath = (todoId: string) => `/todos/${encodeURIComponent(todoId)}`

export const fetchTodos = (signal?: AbortSignal): Promise<Todo[]> =>
  apiClient.get('/todos', z.array(todoSchema), { signal })

export const fetchTodo = (todoId: string, signal?: AbortSignal): Promise<Todo> =>
  apiClient.get(todoPath(todoId), todoSchema, { signal })

export const createTodo = (input: NewTodo): Promise<Todo> =>
  apiClient.post('/todos', input, todoSchema)

export const updateTodo = (todoId: string, changes: TodoChanges): Promise<Todo> =>
  apiClient.patch(todoPath(todoId), changes, todoSchema)

export const deleteTodo = (todoId: string): Promise<void> => apiClient.delete(todoPath(todoId))
