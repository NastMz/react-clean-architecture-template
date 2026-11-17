import { queryOptions } from '@tanstack/react-query'

import { fetchTodo, fetchTodos } from './todoApi'

/**
 * Query key + query function factories. Keys are hierarchical so mutations can
 * invalidate every todo query with `todoQueries.all()`.
 */
export const todoQueries = {
  all: () => ['todos'] as const,
  list: () =>
    queryOptions({
      queryKey: [...todoQueries.all(), 'list'] as const,
      queryFn: ({ signal }) => fetchTodos(signal),
    }),
  detail: (todoId: string) =>
    queryOptions({
      queryKey: [...todoQueries.all(), 'detail', todoId] as const,
      queryFn: ({ signal }) => fetchTodo(todoId, signal),
    }),
}
