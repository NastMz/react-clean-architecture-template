import { getConfig } from '@app/bootstrap/config'
import { createAppFeatureAdapters } from '@app/extensions/registry'
import type { LoggerPort, TelemetryPort } from '@shared/contracts/TelemetryPort'
import { ConsoleTelemetry } from '@shared/observability/ConsoleTelemetry'
import { QueryClient } from '@tanstack/react-query'

/**
 * Application Dependency Injection container
 * Holds app-global services and registry-derived feature adapters.
 *
 * Scope rule:
 * - this module owns global runtime setup (config, telemetry, query client)
 * - feature-specific repositories/use cases stay in `src/app/extensions/<feature>.tsx`
 * - adapters are composed from the extension registry only
 */
export interface AppContainer {
  queryClient: QueryClient
  adapters: ReturnType<typeof createAppFeatureAdapters>
}

/**
 * Creates and configures the dependency injection container
 * Initializes only app-global concerns and delegates feature assembly to registry manifests.
 *
 * @param telemetry - Optional custom telemetry implementation
 *                    Defaults to ConsoleTelemetry
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
  // - Node.js/Tests: ConsoleTelemetry (visible for debugging)
  // - Custom: use provided implementation
  const selectedTelemetry = telemetry ?? new ConsoleTelemetry()

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
