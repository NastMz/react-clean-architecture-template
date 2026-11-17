import type { Todo } from './todo'

export interface TodoSummary {
  total: number
  completed: number
  remaining: number
  /** Whole-number percentage of completed todos (0 when the list is empty). */
  completionRate: number
}

export const summarizeTodos = (todos: readonly Todo[]): TodoSummary => {
  const completed = todos.filter((todo) => todo.completed).length
  const total = todos.length

  return {
    total,
    completed,
    remaining: total - completed,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
  }
}

/** Open todos first, then newest first within each group. Does not mutate the input. */
export const sortTodosForDisplay = (todos: readonly Todo[]): Todo[] =>
  [...todos].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }

    return b.createdAt.localeCompare(a.createdAt)
  })
