import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'

import { authFeature } from './auth'
import type { AppFeatureContext, AppFeatureDefinition } from './contracts'

// Stable extension contract: register each app-facing feature once here.
// Future tooling should append entries to this registry instead of patching
// container/providers/routes independently.
export const appFeatureRegistry = {
  auth: authFeature,
} as const

type AppFeatureRegistry = typeof appFeatureRegistry
type FeatureRegistry = Record<
  string,
  {
    createAdapters: AppFeatureDefinition<unknown>['createAdapters']
  }
>

const getFeatureEntries = <TRegistry extends FeatureRegistry>(registry: TRegistry) =>
  Object.entries(registry) as {
    [K in keyof TRegistry]: [K, TRegistry[K]]
  }[keyof TRegistry][]

export type FeatureAdapters<TRegistry extends FeatureRegistry> = {
  [K in keyof TRegistry]: ReturnType<TRegistry[K]['createAdapters']>
}

export type AppFeatureAdapters = {
  [K in keyof AppFeatureRegistry]: ReturnType<AppFeatureRegistry[K]['createAdapters']>
}

export const createFeatureAdapters = <TRegistry extends FeatureRegistry>(
  registry: TRegistry,
  context: AppFeatureContext,
): FeatureAdapters<TRegistry> =>
  Object.fromEntries(
    getFeatureEntries(registry).map(([featureKey, feature]) => [featureKey, feature.createAdapters(context)]),
  ) as FeatureAdapters<TRegistry>

export const createAppFeatureAdapters = (context: AppFeatureContext): AppFeatureAdapters =>
  createFeatureAdapters(appFeatureRegistry, context)

export const renderFeatureProviders = <TRegistry extends FeatureRegistry>(
  registry: TRegistry & Record<string, { renderProvider?: unknown }>,
  adapters: FeatureAdapters<TRegistry>,
  children: ReactNode,
): ReactNode =>
  getFeatureEntries(registry).reduceRight<ReactNode>((tree, [featureKey, feature]) => {
    const renderProvider = feature.renderProvider as
      | ((params: { adapters: FeatureAdapters<TRegistry>[keyof TRegistry]; children: ReactNode }) => ReactNode)
      | undefined

    if (!renderProvider) {
      return tree
    }

    return renderProvider({
      adapters: adapters[featureKey],
      children: tree,
    } as never)
  }, children)

export const renderAppFeatureProviders = (adapters: AppFeatureAdapters, children: ReactNode): ReactNode =>
  renderFeatureProviders(appFeatureRegistry, adapters, children)

export const getFeatureRoutes = <TRegistry extends FeatureRegistry>(
  registry: TRegistry & Record<string, { routes?: readonly RouteObject[] | undefined }>,
): RouteObject[] =>
  getFeatureEntries(registry).flatMap(([, feature]) => [...(feature.routes ?? [])])

export const getAppFeatureRoutes = (): RouteObject[] => getFeatureRoutes(appFeatureRegistry)
