import type { AppConfig } from '@app/bootstrap/config'
import type { LoggerPort, TelemetryPort } from '@shared/contracts/TelemetryPort'
import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'

export interface AppFeatureNavigationItem {
  label: string
  to: string
}

export interface AppFeatureEntryRoute {
  to: string
  isDefault?: boolean
}

export interface AppFeatureContext {
  config: AppConfig
  queryClient: QueryClient
  telemetry: TelemetryPort & LoggerPort
}

export interface AppFeatureDefinition<TAdapters> {
  createAdapters: (context: AppFeatureContext) => TAdapters
  renderProvider?: (params: { adapters: TAdapters; children: ReactNode }) => ReactNode
  routes?: readonly RouteObject[]
  entryRoute?: AppFeatureEntryRoute
  navigation?: AppFeatureNavigationItem
}
