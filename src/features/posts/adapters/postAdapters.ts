import type { PostUseCases } from '@features/posts/application/postUseCases'
import type { Post } from '@features/posts/domain/Post'

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
 * Converts Result<T, E> responses to React Query compatible format
 */
export const createPostAdapters = (useCases: PostUseCases) => {
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
          return result.value
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
          return result.value
        }
        return {
          queryKey: ['posts', id],
          queryFn,
        } as const
      },
    },
  }
}
