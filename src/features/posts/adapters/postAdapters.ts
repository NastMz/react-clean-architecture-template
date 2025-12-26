import type { HttpClient } from '@shared/infra/http/HttpClient'

import { createPostUseCases } from '../application/postUseCases'
import { createHttpPostRepository } from '../infra/httpPostRepository'

/**
 * Post Feature Adapters
 * Composition of infrastructure, repositories, and use cases
 * Wires HttpClient to repositories to use cases
 */
export const createPostAdapters = (httpClient: HttpClient) => {
  const postRepository = createHttpPostRepository(httpClient)
  const useCases = createPostUseCases(postRepository)

  return {
    /**
     * React Query queries for posts
     */
    queries: {
      /**
       * Query configuration for fetching all posts
       */
      list: () => ({
        queryKey: ['posts', 'list'],
        queryFn: () => useCases.getPosts(),
      }),

      /**
       * Query configuration for fetching a single post
       */
      detail: (id: number) => ({
        queryKey: ['posts', id],
        queryFn: () => useCases.getPost(id),
      }),
    },
  }
}
