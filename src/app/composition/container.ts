import type { LoggerPort } from '@shared/application/ports/LoggerPort'
import type { TelemetryPort } from '@shared/application/ports/TelemetryPort'
import { QueryClient } from '@tanstack/react-query'

import type { AuthAdapters } from '@features/auth/adapters/authAdapters'
import { createAuthAdapters } from '@features/auth/adapters/authAdapters'
import { createAuthUseCases } from '@features/auth/application/authUseCases'
import { createInMemoryAuthRepository } from '@features/auth/infra/inMemoryAuthRepository'
// import { createHttpAuthRepository } from '@features/auth/infra/httpAuthRepository'
import { createFetchHttpClient } from '@shared/infra/http/HttpClient'
import { ConsoleTelemetry } from '@shared/infra/telemetry/ConsoleTelemetry'
import { OpenTelemetryAdapter } from '@shared/infra/telemetry/OpenTelemetryAdapter'

/**
 * Application Dependency Injection container
 * Holds all services, adapters, and the React Query client
 *
 * Minimal scope: just Auth feature
 * - Domain logic validated in tests
 * - UI patterns taught via AuthPage example
 * - Teams extend this for their own features
 */
export interface AppContainer {
  queryClient: QueryClient
  adapters: {
    auth: AuthAdapters
  }
}

/**
 * Creates and configures the dependency injection container
 * Initializes repository, use cases, adapters, and React Query
 *
 * @param telemetry - Optional custom telemetry implementation
 *                    Defaults to: OpenTelemetryAdapter in browser, ConsoleTelemetry in Node.js/SSR
 * @returns Fully configured application container with all dependencies
 */
export const createContainer = (telemetry?: TelemetryPort & LoggerPort): AppContainer => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })

  // Default telemetry selection:
  // - Browser: OpenTelemetryAdapter (invisible without backend exporter)
  // - Node.js/Tests: ConsoleTelemetry (visible for debugging)
  // - Custom: use provided implementation
  const selectedTelemetry =
    telemetry ??
    (typeof window !== 'undefined' ? new OpenTelemetryAdapter() : new ConsoleTelemetry())

  // ============================================================================
  // Auth Repository Setup
  // ============================================================================
  //
  // **DEMO MODE (Current)**: In-memory repository with mock data
  // - No HTTP calls, instant responses
  // - Credentials: demo@example.com / any password
  // - Perfect for prototyping and testing UI
  //
  // **PRODUCTION MODE**: HTTP repository with resilience patterns
  // - Uncomment lines below to switch
  // - Includes automatic retries (3 attempts, exponential backoff)
  // - Circuit breaker protection available (see httpAuthRepository.ts)
  // - Requires API_BASE_URL environment variable
  //
  // const httpClient = createFetchHttpClient({ baseUrl: import.meta.env.VITE_API_BASE_URL })
  // const authRepository = createHttpAuthRepository(httpClient, selectedTelemetry, {
  //   baseUrl: import.meta.env.VITE_API_BASE_URL,
  // })
  //
  // For now, using in-memory demo:
  const authRepository = createInMemoryAuthRepository(selectedTelemetry)
  const authUseCases = createAuthUseCases(authRepository, selectedTelemetry)
  const authAdapters = createAuthAdapters({ useCases: authUseCases, queryClient })

  return {
    queryClient,
    adapters: {
      auth: authAdapters,
    },
  }
}
