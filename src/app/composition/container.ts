import type { LoggerPort } from '@shared/application/ports/LoggerPort'
import type { TelemetryPort } from '@shared/application/ports/TelemetryPort'
import { QueryClient } from '@tanstack/react-query'

import type { AuthAdapters } from '@features/auth/adapters/authAdapters'
import { createAuthAdapters } from '@features/auth/adapters/authAdapters'
import { createAuthUseCases } from '@features/auth/application/authUseCases'
import { createInMemoryAuthRepository } from '@features/auth/infra/inMemoryAuthRepository'
import { createHttpAuthRepository } from '@features/auth/infra/httpAuthRepository'
import { createFetchHttpClient } from '@shared/infra/http/HttpClient'
import { ConsoleTelemetry } from '@shared/infra/telemetry/ConsoleTelemetry'
import { OpenTelemetryAdapter } from '@shared/infra/telemetry/OpenTelemetryAdapter'
import { getConfig } from '@app/bootstrap/config'

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
  // DEMO MODE (default): In-memory repository with mock data
  // PRODUCTION MODE: HTTP repository with resilience patterns and interceptors
  // Config (env access centralized via getConfig -> getEnv)
  const config = getConfig()

  const authRepository = (() => {
    if (!config.useHttp) {
      return createInMemoryAuthRepository(selectedTelemetry)
    }

    // Interceptor-enabled HTTP client
    const baseUrl = config.apiBaseUrl

    // Separate client for refresh (no interceptors to avoid recursion)
    const refreshClient = createFetchHttpClient({ baseUrl })

    const httpClient = createFetchHttpClient({
      baseUrl,
      getAuthToken: () =>
        typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null,
      onRequest: async (req) => ({
        ...req,
        headers: { ...req.headers, 'X-App': 'clean-template' },
      }),
      onResponse: ({ request, status, durationMs }) => {
        if (typeof window !== 'undefined') {
          // Lightweight console logging; swap for telemetry if preferred
          console.info(
            `[http] ${request.method} ${request.url} -> ${status} in ${durationMs.toFixed(0)}ms`,
          )
        }
      },
      refreshToken: async () => {
        const result = await refreshClient.request<{ accessToken: string }>({
          method: 'POST',
          url: '/auth/refresh',
          skipInterceptors: true,
        })
        return result.match({
          ok: ({ data }) => {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('access_token', data.accessToken)
            }
            return data.accessToken
          },
          err: () => null,
        })
      },
    })

    return createHttpAuthRepository(httpClient, selectedTelemetry, { baseUrl })
  })()
  const authUseCases = createAuthUseCases(authRepository, selectedTelemetry)
  const authAdapters = createAuthAdapters({ useCases: authUseCases, queryClient })

  return {
    queryClient,
    adapters: {
      auth: authAdapters,
    },
  }
}
