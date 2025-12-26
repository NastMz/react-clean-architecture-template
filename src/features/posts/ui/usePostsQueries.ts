import { useContainer } from '@app/composition/useContainer'
import { useQuery } from '@tanstack/react-query'

import type { Post } from '../domain/Post'

/**
 * Hook: Get all posts
 * Properly typed query for posts list
 * Handles Result<T, E> conversion from adapters
 */
export const usePostsList = () => {
  const { adapters } = useContainer()
  return useQuery<Post[], Error>({
    ...adapters.posts.queries.list(),
  })
}

/**
 * Hook: Get single post by ID
 * Properly typed query for post details
 * Automatically disabled if no ID provided
 * Handles Result<T, E> conversion from adapters
 */
export const usePost = (id: number | null) => {
  const { adapters } = useContainer()
  return useQuery<Post, Error>({
    ...adapters.posts.queries.detail(id ?? 0),
    enabled: id !== null,
  })
}
