import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'

import { authFeature } from './auth'
import type { AppFeatureContext } from './contracts'

// Stable extension contract: register each app-facing feature once here.
// Future tooling should append entries to this registry instead of patching
// container/providers/routes independently.
export const appFeatureRegistry = {
  auth: authFeature,
} as const

type AppFeatureRegistry = typeof appFeatureRegistry
type AppFeatureEntry = {
  [K in keyof AppFeatureRegistry]: [K, AppFeatureRegistry[K]]
}[keyof AppFeatureRegistry]

const appFeatureEntries = Object.entries(appFeatureRegistry) as AppFeatureEntry[]

export type AppFeatureAdapters = {
  [K in keyof AppFeatureRegistry]: ReturnType<AppFeatureRegistry[K]['createAdapters']>
}

export const createAppFeatureAdapters = (context: AppFeatureContext): AppFeatureAdapters =>
  Object.fromEntries(
    appFeatureEntries.map(([featureKey, feature]) => [featureKey, feature.createAdapters(context)]),
  ) as AppFeatureAdapters

export const renderAppFeatureProviders = (
  adapters: AppFeatureAdapters,
  children: ReactNode,
): ReactNode =>
  appFeatureEntries.reduceRight<ReactNode>((tree, [featureKey, feature]) => {
    if (!feature.renderProvider) {
      return tree
    }

    return feature.renderProvider({
      adapters: adapters[featureKey],
      children: tree,
    } as never)
  }, children)

export const getAppFeatureRoutes = (): RouteObject[] =>
  appFeatureEntries.flatMap(([, feature]) => [...(feature.routes ?? [])])
