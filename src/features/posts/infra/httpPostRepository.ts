import type { HttpClient } from '@shared/infra/http/HttpClient'

import type { PostRepository } from '../application/ports/PostRepository'
import type { Post } from '../domain/Post'

/**
 * HTTP Post Repository Implementation
 * Fetches posts from JSONPlaceholder API
 * Demonstrates HttpClient usage for external API communication
 */
export const createHttpPostRepository = (httpClient: HttpClient): PostRepository => ({
  async getPosts() {
    return httpClient.request<Post[]>({
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts',
    })
  },

  async getPost(id: number) {
    return httpClient.request<Post>({
      method: 'GET',
      url: `https://jsonplaceholder.typicode.com/posts/${id}`,
    })
  },
})
