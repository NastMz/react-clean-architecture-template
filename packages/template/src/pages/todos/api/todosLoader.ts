import type { QueryClient } from '@tanstack/react-query'

import { todoQueries } from '@/entities/todo'

/** Starts fetching before the page renders (render-as-you-fetch). */
export const todosLoader = (queryClient: QueryClient) => async () => {
  await queryClient.query(todoQueries.list())
  return null
}
