import type { PostRepository } from '@features/posts/application/ports/PostRepository'
import type { Post } from '@features/posts/domain/Post'
import type { HttpClient } from '@shared/infra/http/HttpClient'

/**
 * HTTP Post Repository Implementation
 * Fetches posts from JSONPlaceholder API
 * Demonstrates HttpClient usage for external API communication
 */
export const createHttpPostRepository = (httpClient: HttpClient): PostRepository => ({
  async getPosts() {
    const result = await httpClient.request<Post[]>({
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts',
    })
    return result.map((response) => response.data)
  },

  async getPost(id: number) {
    const result = await httpClient.request<Post>({
      method: 'GET',
      url: `https://jsonplaceholder.typicode.com/posts/${id}`,
    })
    return result.map((response) => response.data)
  },
})
