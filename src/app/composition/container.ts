import type { AuthAdapters } from '@features/auth/adapters/authAdapters'
import { createAuthAdapters } from '@features/auth/adapters/authAdapters'
import { createAuthUseCases } from '@features/auth/application/authUseCases'
import { createInMemoryAuthRepository } from '@features/auth/infra/inMemoryAuthRepository'
import type { TodoAdapters } from '@features/todo/adapters/todoAdapters'
import { createTodoAdapters } from '@features/todo/adapters/todoAdapters'
import { createTodoUseCases } from '@features/todo/application/todoUseCases'
import { createInMemoryTodoRepository } from '@features/todo/infra/inMemoryTodoRepository'
import { ConsoleTelemetry } from '@shared/infra/telemetry/ConsoleTelemetry'
import { QueryClient } from '@tanstack/react-query'

export interface AppContainer {
  queryClient: QueryClient
  adapters: {
    auth: AuthAdapters
    todo: TodoAdapters
  }
}

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

  const authRepository = createInMemoryAuthRepository(telemetry)
  const authUseCases = createAuthUseCases(authRepository, telemetry)
  const authAdapters = createAuthAdapters({ useCases: authUseCases, queryClient })

  const todoRepository = createInMemoryTodoRepository()
  const todoUseCases = createTodoUseCases(todoRepository, telemetry)
  const todoAdapters = createTodoAdapters({ useCases: todoUseCases, queryClient })

  return {
    queryClient,
    adapters: {
      auth: authAdapters,
      todo: todoAdapters,
    },
  }
}
