import type { QueryClient } from '@tanstack/react-query'
import type { LoaderFunctionArgs } from 'react-router'

import { todoQueries } from '@/entities/todo'

export const todoDetailsLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    await queryClient.query(todoQueries.detail(params.todoId ?? ''))
    return null
  }
