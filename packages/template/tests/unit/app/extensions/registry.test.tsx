import type { AppConfig } from '@app/bootstrap/config'
import { defineAppFeature } from '@app/extensions/contracts'
import {
  appFeatureRegistry,
  createFeatureAdapters,
  getDefaultFeatureRoute,
  getFeatureEntryRoutes,
  getFeatureNavigation,
  getFeatureRoutes,
  renderFeatureProviders,
} from '@app/extensions/registry'
import type { AppFeatureContext } from '@app/extensions/contracts'
import { QueryClient } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const collectRoutePaths = (routes: readonly RouteObject[]): string[] =>
  routes.flatMap((route) => {
    const childPaths = collectRoutePaths(route.children ?? [])

    return typeof route.path === 'string' ? [route.path, ...childPaths] : childPaths
  })

const config: AppConfig = {
  featureFlags: {},
}

const telemetry = {
  track: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

const createContext = (): AppFeatureContext => ({
  config,
  queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  telemetry,
})

describe('app feature registry helpers', () => {
  it('creates adapters for every registered feature with the same app context', () => {
    const registry = {
      auth: {
        createAdapters: vi.fn((context: AppFeatureContext) => ({
          feature: 'auth',
          featureFlags: context.config.featureFlags,
          queryClient: context.queryClient,
        })),
      },
      todo: {
        createAdapters: vi.fn((context: AppFeatureContext) => ({
          feature: 'todo',
          telemetry: context.telemetry,
        })),
      },
    }

    const context = createContext()

    const adapters = createFeatureAdapters(registry, context)

    expect(registry.auth.createAdapters).toHaveBeenCalledWith(context)
    expect(registry.todo.createAdapters).toHaveBeenCalledWith(context)
    expect(adapters.auth).toEqual({
      feature: 'auth',
      featureFlags: {},
      queryClient: context.queryClient,
    })
    expect(adapters.todo).toEqual({
      feature: 'todo',
      telemetry: context.telemetry,
    })
  })

  it('nests feature providers in registry order and skips features without providers', () => {
    const registry = {
      auth: {
        createAdapters: () => ({ label: 'auth-adapter' }),
        renderProvider: ({
          adapters,
          children,
        }: {
          adapters: { label: string }
          children: ReactNode
        }) => (
          <section data-testid="auth-provider" data-adapter={adapters.label}>
            {children}
          </section>
        ),
      },
      todo: {
        createAdapters: () => ({ label: 'todo-adapter' }),
        renderProvider: ({
          adapters,
          children,
        }: {
          adapters: { label: string }
          children: ReactNode
        }) => (
          <section data-testid="todo-provider" data-adapter={adapters.label}>
            {children}
          </section>
        ),
      },
      analytics: {
        createAdapters: () => ({ label: 'analytics-adapter' }),
      },
    }

    const tree = renderFeatureProviders(
      registry,
      createFeatureAdapters(registry, createContext()),
      <div data-testid="leaf">leaf</div>,
    )

    render(<>{tree}</>)

    const authProvider = screen.getByTestId('auth-provider')
    const todoProvider = screen.getByTestId('todo-provider')
    const leaf = screen.getByTestId('leaf')

    expect(authProvider).toContainElement(todoProvider)
    expect(todoProvider).toContainElement(leaf)
    expect(authProvider).toHaveAttribute('data-adapter', 'auth-adapter')
    expect(todoProvider).toHaveAttribute('data-adapter', 'todo-adapter')
  })

  it('flattens routes from multiple registered features in registry order', () => {
    const registry = {
      auth: {
        createAdapters: () => ({ label: 'auth-adapter' }),
        routes: [{ path: '/auth', element: <div>auth</div> }],
      },
      todo: {
        createAdapters: () => ({ label: 'todo-adapter' }),
        routes: [
          { path: '/todo', element: <div>todo</div> },
          { path: '/todo/:id', element: <div>detail</div> },
        ],
      },
    }

    expect(getFeatureRoutes(registry).map((route) => route.path)).toEqual([
      '/auth',
      '/todo',
      '/todo/:id',
    ])
  })

  it('collects navigation entries from registered features in registry order', () => {
    const registry = {
      auth: {
        createAdapters: () => ({ label: 'auth-adapter' }),
        navigation: { label: 'Auth', to: '/auth' },
      },
      todo: {
        createAdapters: () => ({ label: 'todo-adapter' }),
        navigation: { label: 'Todo', to: '/todo' },
      },
      analytics: {
        createAdapters: () => ({ label: 'analytics-adapter' }),
      },
    }

    expect(getFeatureNavigation(registry)).toEqual([
      { label: 'Auth', to: '/auth' },
      { label: 'Todo', to: '/todo' },
    ])
  })

  it('collects entry routes separately from visible navigation', () => {
    const registry = {
      auth: {
        createAdapters: () => ({ label: 'auth-adapter' }),
        entryRoute: { to: '/auth', isDefault: true },
        navigation: { label: 'Auth', to: '/auth' },
      },
      invite: {
        createAdapters: () => ({ label: 'invite-adapter' }),
        entryRoute: { to: '/invite' },
      },
    }

    expect(getFeatureNavigation(registry)).toEqual([{ label: 'Auth', to: '/auth' }])
    expect(getFeatureEntryRoutes(registry)).toEqual([
      { to: '/auth', isDefault: true },
      { to: '/invite' },
    ])
  })

  it('uses an entry route without navigation as a valid landing route candidate', () => {
    const registry = {
      invite: {
        createAdapters: () => ({ label: 'invite-adapter' }),
        entryRoute: { to: '/invite', isDefault: true },
      },
      auth: {
        createAdapters: () => ({ label: 'auth-adapter' }),
        navigation: { label: 'Auth', to: '/auth' },
        routes: [{ path: '/auth', element: <div>auth</div> }],
      },
    }

    expect(getFeatureNavigation(registry)).toEqual([{ label: 'Auth', to: '/auth' }])
    expect(getDefaultFeatureRoute(registry)).toBe('/invite')
  })

  it('prefers the feature marked as default for the app landing route', () => {
    const registry = {
      auth: {
        createAdapters: () => ({ label: 'auth-adapter' }),
        entryRoute: { to: '/auth' },
        navigation: { label: 'Auth', to: '/auth' },
      },
      todo: {
        createAdapters: () => ({ label: 'todo-adapter' }),
        entryRoute: { to: '/todo', isDefault: true },
        navigation: { label: 'Todo', to: '/todo' },
      },
    }

    expect(getDefaultFeatureRoute(registry)).toBe('/todo')
  })

  it('falls back to the first entry route when no default route is declared', () => {
    const registry = {
      auth: {
        createAdapters: () => ({ label: 'auth-adapter' }),
        entryRoute: { to: '/auth' },
        navigation: { label: 'Auth', to: '/auth' },
      },
      todo: {
        createAdapters: () => ({ label: 'todo-adapter' }),
        entryRoute: { to: '/todo' },
        navigation: { label: 'Todo', to: '/todo' },
      },
    }

    expect(getDefaultFeatureRoute(registry)).toBe('/auth')
  })

  it('throws when multiple features are marked as default', () => {
    const registry = {
      auth: {
        createAdapters: () => ({ label: 'auth-adapter' }),
        entryRoute: { to: '/auth', isDefault: true },
        navigation: { label: 'Auth', to: '/auth' },
      },
      todo: {
        createAdapters: () => ({ label: 'todo-adapter' }),
        entryRoute: { to: '/todo', isDefault: true },
        navigation: { label: 'Todo', to: '/todo' },
      },
    }

    expect(() => getDefaultFeatureRoute(registry)).toThrowError(
      'Multiple app features are marked as default: /auth, /todo',
    )
  })

  it('ignores visible navigation when resolving entry routes', () => {
    const registry = {
      auth: {
        createAdapters: () => ({ label: 'auth-adapter' }),
        navigation: { label: 'Auth', to: '/auth' },
      },
      todo: {
        createAdapters: () => ({ label: 'todo-adapter' }),
        navigation: { label: 'Todo', to: '/todo' },
      },
    }

    expect(getFeatureNavigation(registry)).toEqual([
      { label: 'Auth', to: '/auth' },
      { label: 'Todo', to: '/todo' },
    ])
    expect(getFeatureEntryRoutes(registry)).toEqual([])
    expect(getDefaultFeatureRoute(registry)).toBeNull()
  })

  it('returns null when the registry has no entry routes', () => {
    const registry = {
      analytics: {
        createAdapters: () => ({ label: 'analytics-adapter' }),
      },
    }

    expect(getDefaultFeatureRoute(registry)).toBeNull()
  })

  it('keeps each registered feature manifest aligned with its own declared routes', () => {
    for (const [featureKey, feature] of Object.entries(appFeatureRegistry)) {
      const routePaths = collectRoutePaths(feature.routes ?? [])

      if (feature.entryRoute) {
        expect(routePaths, `${featureKey} entryRoute must target a declared route`).toContain(
          feature.entryRoute.to,
        )
      }

      if (feature.navigation) {
        expect(routePaths, `${featureKey} navigation must target a declared route`).toContain(
          feature.navigation.to,
        )
      }
    }
  })

  it('keeps auth and todo as the canonical registered feature keys', () => {
    expect(Object.keys(appFeatureRegistry)).toEqual(['auth', 'todo'])
  })

  it('throws when an entry route does not match any declared feature route', () => {
    expect(() =>
      defineAppFeature({
        createAdapters: () => ({ label: 'invite-adapter' }),
        routes: [{ path: '/invite', element: <div>invite</div> }],
        entryRoute: { to: '/landing' },
      }),
    ).toThrowError(
      'App feature entryRoute target "/landing" must match one of its declared routes: /invite',
    )
  })

  it('throws when navigation does not match any declared feature route', () => {
    expect(() =>
      defineAppFeature({
        createAdapters: () => ({ label: 'invite-adapter' }),
        routes: [{ path: '/invite', element: <div>invite</div> }],
        navigation: { label: 'Invite', to: '/home' },
      }),
    ).toThrowError(
      'App feature navigation target "/home" must match one of its declared routes: /invite',
    )
  })

  it('throws when a feature tries to target another feature route from its own manifest', () => {
    expect(() =>
      defineAppFeature({
        createAdapters: () => ({ label: 'invite-adapter' }),
        routes: [{ path: '/invite', element: <div>invite</div> }],
        entryRoute: { to: '/auth' },
        navigation: { label: 'Invite', to: '/auth' },
      }),
    ).toThrowError(
      'App feature entryRoute target "/auth" must match one of its declared routes: /invite',
    )
  })
})
