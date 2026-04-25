import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'

// @scaffold-feature-imports:start
import { authFeature } from './auth'
import type {
  AppFeatureContext,
  AppFeatureDefinition,
  AppFeatureEntryRoute,
  AppFeatureNavigationItem,
} from './contracts'
import { todoFeature } from './todo'
// @scaffold-feature-imports:end

// Canonical app integration seam: register each app-facing feature once here.
// Future tooling should append manifests here instead of patching adapters,
// providers, routes, navigation, or the landing route independently.
export const appFeatureRegistry = {
  // @scaffold-feature-entries:start
  auth: authFeature,
  todo: todoFeature,
  // @scaffold-feature-entries:end
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

// Registry consumers derive adapters from one registration point.
export const createFeatureAdapters = <TRegistry extends FeatureRegistry>(
  registry: TRegistry,
  context: AppFeatureContext,
): FeatureAdapters<TRegistry> =>
  Object.fromEntries(
    getFeatureEntries(registry).map(([featureKey, feature]) => [
      featureKey,
      feature.createAdapters(context),
    ]),
  ) as FeatureAdapters<TRegistry>

export const createAppFeatureAdapters = (context: AppFeatureContext): AppFeatureAdapters =>
  createFeatureAdapters(appFeatureRegistry, context)

// Providers are nested from the registered manifests only.
export const renderFeatureProviders = <TRegistry extends FeatureRegistry>(
  registry: TRegistry & Record<string, { renderProvider?: unknown }>,
  adapters: FeatureAdapters<TRegistry>,
  children: ReactNode,
): ReactNode =>
  getFeatureEntries(registry).reduceRight<ReactNode>((tree, [featureKey, feature]) => {
    const renderProvider = feature.renderProvider as
      | ((params: {
          adapters: FeatureAdapters<TRegistry>[keyof TRegistry]
          children: ReactNode
        }) => ReactNode)
      | undefined

    if (!renderProvider) {
      return tree
    }

    return renderProvider({
      adapters: adapters[featureKey],
      children: tree,
    } as never)
  }, children)

export const renderAppFeatureProviders = (
  adapters: AppFeatureAdapters,
  children: ReactNode,
): ReactNode => renderFeatureProviders(appFeatureRegistry, adapters, children)

// Routes are derived from the registry so app routing stays aligned with manifests.
export const getFeatureRoutes = <TRegistry extends FeatureRegistry>(
  registry: TRegistry & Record<string, { routes?: readonly RouteObject[] | undefined }>,
): RouteObject[] =>
  getFeatureEntries(registry).flatMap(([, feature]) => [...(feature.routes ?? [])])

export const getAppFeatureRoutes = (): RouteObject[] => getFeatureRoutes(appFeatureRegistry)

// Navigation is optional per feature and still resolved from the same registry.
export const getFeatureNavigation = <TRegistry extends FeatureRegistry>(
  registry: TRegistry & Record<string, { navigation?: AppFeatureNavigationItem | undefined }>,
): AppFeatureNavigationItem[] =>
  getFeatureEntries(registry).flatMap(([, feature]) =>
    feature.navigation ? [feature.navigation] : [],
  )

export const getAppFeatureNavigation = (): AppFeatureNavigationItem[] =>
  getFeatureNavigation(appFeatureRegistry)

// Entry routes are resolved separately from shell navigation.
export const getFeatureEntryRoutes = <TRegistry extends FeatureRegistry>(
  registry: TRegistry & Record<string, { entryRoute?: AppFeatureEntryRoute | undefined }>,
): AppFeatureEntryRoute[] =>
  getFeatureEntries(registry).flatMap(([, feature]) =>
    feature.entryRoute ? [feature.entryRoute] : [],
  )

const getDefaultEntryRoute = (entryRoutes: AppFeatureEntryRoute[]): AppFeatureEntryRoute | null => {
  const defaultItems = entryRoutes.filter((item) => item.isDefault)

  if (defaultItems.length > 1) {
    throw new Error(
      `Multiple app features are marked as default: ${defaultItems.map((item) => item.to).join(', ')}`,
    )
  }

  return defaultItems[0] ?? null
}

export const getDefaultFeatureRoute = <TRegistry extends FeatureRegistry>(
  registry: TRegistry & Record<string, { entryRoute?: AppFeatureEntryRoute | undefined }>,
): string | null => {
  const entryRoutes = getFeatureEntryRoutes(registry)

  return getDefaultEntryRoute(entryRoutes)?.to ?? entryRoutes[0]?.to ?? null
}

export const getAppDefaultRoute = (): string => getDefaultFeatureRoute(appFeatureRegistry) ?? '/'
