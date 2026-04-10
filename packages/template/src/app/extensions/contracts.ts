import type { AppConfig } from '@app/bootstrap/config'
import type { LoggerPort, TelemetryPort } from '@shared/contracts/TelemetryPort'
import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'

export interface AppFeatureNavigationItem {
  label: string
  to: string
}

/**
 * Landing-route contract derived by the registry.
 *
 * A feature may expose an entry route without contributing a shell navigation item.
 */
export interface AppFeatureEntryRoute {
  to: string
  isDefault?: boolean
}

export interface AppFeatureContext {
  config: AppConfig
  queryClient: QueryClient
  telemetry: TelemetryPort & LoggerPort
}

/**
 * Canonical manifest shape for app-facing features.
 *
 * `src/app/extensions/<feature>.tsx` defines one manifest and
 * `src/app/extensions/registry.tsx` registers it once for the whole app.
 */
export interface AppFeatureDefinition<TAdapters> {
  createAdapters: (context: AppFeatureContext) => TAdapters
  renderProvider?: (params: { adapters: TAdapters; children: ReactNode }) => ReactNode
  routes?: readonly RouteObject[]
  entryRoute?: AppFeatureEntryRoute
  navigation?: AppFeatureNavigationItem
}

const collectRoutePaths = (routes: readonly RouteObject[] | undefined): string[] =>
  (routes ?? []).flatMap((route) => {
    const childPaths = collectRoutePaths(route.children)

    return typeof route.path === 'string' ? [route.path, ...childPaths] : childPaths
  })

const formatAvailableRoutes = (routePaths: string[]): string =>
  routePaths.length > 0 ? routePaths.join(', ') : '(no declared route paths)'

const assertFeatureTargetMatchesRoutes = ({
  label,
  target,
  routePaths,
}: {
  label: 'entryRoute' | 'navigation'
  target: string
  routePaths: string[]
}) => {
  if (routePaths.includes(target)) {
    return
  }

  throw new Error(
    `App feature ${label} target "${target}" must match one of its declared routes: ${formatAvailableRoutes(routePaths)}`,
  )
}

/**
 * Defines a feature manifest and validates that manifest-owned targets point
 * to routes declared by the same manifest.
 */
export const defineAppFeature = <TAdapters>(
  feature: AppFeatureDefinition<TAdapters>,
): AppFeatureDefinition<TAdapters> => {
  const routePaths = collectRoutePaths(feature.routes)

  if (feature.entryRoute) {
    assertFeatureTargetMatchesRoutes({
      label: 'entryRoute',
      target: feature.entryRoute.to,
      routePaths,
    })
  }

  if (feature.navigation) {
    assertFeatureTargetMatchesRoutes({
      label: 'navigation',
      target: feature.navigation.to,
      routePaths,
    })
  }

  return feature
}
