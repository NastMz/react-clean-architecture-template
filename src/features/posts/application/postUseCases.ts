import type { AppError } from '@shared/domain/errors/AppError'
import type { Result } from '@shared/domain/result/Result'

import type { Post } from '../domain/Post'
import type { PostRepository } from './ports/PostRepository'

/**
 * Post use cases interface
 * Orchestrates business logic by coordinating repositories
 * Provides high-level operations for the UI layer
 */
export interface PostUseCases {
  getPosts(): Promise<Result<Post[], AppError>>
  getPost(id: number): Promise<Result<Post, AppError>>
}

export const createPostUseCases = (postRepository: PostRepository): PostUseCases => ({
  /**
   * Fetches all posts
   */
  getPosts: () => postRepository.getPosts(),

  /**
   * Fetches a single post by ID
   */
  getPost: (id: number) => postRepository.getPost(id),
})
