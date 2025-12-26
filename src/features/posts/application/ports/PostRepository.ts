import type { AppError } from '@shared/domain/errors/AppError'
import type { Result } from '@shared/domain/result/Result'

import type { Post } from '../domain/Post'

/**
 * Post Repository Port (Interface)
 * Defines contract for fetching posts
 * Implementation can switch between API and mock data
 */
export interface PostRepository {
  /**
   * Fetches all posts
   * @returns Result containing array of posts or AppError
   */
  getPosts(): Promise<Result<Post[], AppError>>

  /**
   * Fetches a single post by ID
   * @param id - Post ID
   * @returns Result containing post or AppError
   */
  getPost(id: number): Promise<Result<Post, AppError>>
}
