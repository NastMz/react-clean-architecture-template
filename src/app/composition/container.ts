import type { AuthAdapters } from '@features/auth/adapters/authAdapters'
import { createAuthAdapters } from '@features/auth/adapters/authAdapters'
import { createAuthUseCases } from '@features/auth/application/authUseCases'
import { createInMemoryAuthRepository } from '@features/auth/infra/inMemoryAuthRepository'
import type { TodoAdapters } from '@features/todo/adapters/todoAdapters'
import { createTodoAdapters } from '@features/todo/adapters/todoAdapters'
import { createTodoUseCases } from '@features/todo/application/todoUseCases'
import { createInMemoryTodoRepository } from '@features/todo/infra/inMemoryTodoRepository'
import { createPostAdapters } from '@features/posts/adapters/postAdapters'
import { createPostUseCases } from '@features/posts/application/postUseCases'
import { createHttpPostRepository } from '@features/posts/infra/httpPostRepository'
import { createFetchHttpClient } from '@shared/infra/http/HttpClient'
import { ConsoleTelemetry } from '@shared/infra/telemetry/ConsoleTelemetry'
import { QueryClient } from '@tanstack/react-query'

/**
 * Application Dependency Injection container
 * Holds all services, adapters, and the React Query client
 */
export interface AppContainer {
  queryClient: QueryClient
  adapters: {
    auth: AuthAdapters
    todo: TodoAdapters
    posts: ReturnType<typeof createPostAdapters>
  }
}

/**
 * Creates and configures the dependency injection container
 * Initializes all repositories, use cases, adapters, and React Query
 * @returns Fully configured application container with all dependencies
 */
export const createContainer = (): AppContainer => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })

  const telemetry = new ConsoleTelemetry()

  // Initialize HTTP client for external API calls
  const httpClient = createFetchHttpClient()

  // Auth feature setup
  const authRepository = createInMemoryAuthRepository(telemetry)
  const authUseCases = createAuthUseCases(authRepository, telemetry)
  const authAdapters = createAuthAdapters({ useCases: authUseCases, queryClient })

  // Todo feature setup
  const todoRepository = createInMemoryTodoRepository()
  const todoUseCases = createTodoUseCases(todoRepository, telemetry)
  const todoAdapters = createTodoAdapters({ useCases: todoUseCases, queryClient })

  // Posts feature setup (demonstrates HttpClient usage)
  const postRepository = createHttpPostRepository(httpClient)
  const postUseCases = createPostUseCases(postRepository)
  const postAdapters = createPostAdapters(postUseCases)

  return {
    queryClient,
    adapters: {
      auth: authAdapters,
      todo: todoAdapters,
      posts: postAdapters,
    },
  }
}
