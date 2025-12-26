import type { PostRepository } from './ports/PostRepository'

/**
 * Post use cases
 * Orchestrates business logic by coordinating repositories
 * Provides high-level operations for the UI layer
 */
export const createPostUseCases = (postRepository: PostRepository) => ({
  /**
   * Fetches all posts
   */
  getPosts: () => postRepository.getPosts(),

  /**
   * Fetches a single post by ID
   */
  getPost: (id: number) => postRepository.getPost(id),
})
