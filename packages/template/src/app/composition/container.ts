import { getConfig } from '@app/bootstrap/config'
import { createAppFeatureAdapters } from '@app/extensions/registry'
import type { LoggerPort, TelemetryPort } from '@shared/contracts/TelemetryPort'
import { ConsoleTelemetry } from '@shared/observability/ConsoleTelemetry'
import { OpenTelemetryAdapter } from '@shared/observability/OpenTelemetryAdapter'
import { QueryClient } from '@tanstack/react-query'

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
  adapters: ReturnType<typeof createAppFeatureAdapters>
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

  const config = getConfig()

  return {
    queryClient,
    adapters: createAppFeatureAdapters({
      config,
      queryClient,
      telemetry: selectedTelemetry,
    }),
  }
}
