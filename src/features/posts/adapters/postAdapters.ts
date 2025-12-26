import type { HttpClient } from '@shared/infra/http/HttpClient'

import { createPostUseCases } from '../application/postUseCases'
import type { Post } from '../domain/Post'
import { createHttpPostRepository } from '../infra/httpPostRepository'

/**
 * Custom error class for posts feature
 * Wraps AppError as a throwable Error for React Query
 */
class PostsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PostsError'
  }
}

/**
 * Post Feature Adapters
 * Composition of infrastructure, repositories, and use cases
 * Converts Result<T, E> responses to React Query compatible format
 */
export const createPostAdapters = (httpClient: HttpClient) => {
  const postRepository = createHttpPostRepository(httpClient)
  const useCases = createPostUseCases(postRepository)

  return {
    /**
     * React Query queries for posts
     * Handles Result<T, E> conversion to throwable errors for React Query
     */
    queries: {
      /**
       * Query configuration for fetching all posts
       */
      list: () => {
        const queryFn = async (): Promise<Post[]> => {
          const result = await useCases.getPosts()
          if (result.isErr) {
            throw new PostsError(result.error.message)
          }
          return result.value as Post[]
        }
        return {
          queryKey: ['posts', 'list'],
          queryFn,
        } as const
      },

      /**
       * Query configuration for fetching a single post
       */
      detail: (id: number) => {
        const queryFn = async (): Promise<Post> => {
          const result = await useCases.getPost(id)
          if (result.isErr) {
            throw new PostsError(result.error.message)
          }
          return result.value as Post
        }
        return {
          queryKey: ['posts', id],
          queryFn,
        } as const
      },
    },
  }
}
