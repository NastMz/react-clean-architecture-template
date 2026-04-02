import type { AppConfig } from '@app/bootstrap/config'
import {
  createFeatureAdapters,
  getFeatureNavigation,
  getFeatureRoutes,
  renderFeatureProviders,
} from '@app/extensions/registry'
import type { AppFeatureContext } from '@app/extensions/contracts'
import { QueryClient } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const config: AppConfig = {
  apiBaseUrl: 'https://api.example.com',
  useHttp: false,
  authRepositoryType: 'memory',
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
          baseUrl: context.config.apiBaseUrl,
          queryClient: context.queryClient,
        })),
      },
      products: {
        createAdapters: vi.fn((context: AppFeatureContext) => ({
          feature: 'products',
          telemetry: context.telemetry,
        })),
      },
    }

    const context = createContext()

    const adapters = createFeatureAdapters(registry, context)

    expect(registry.auth.createAdapters).toHaveBeenCalledWith(context)
    expect(registry.products.createAdapters).toHaveBeenCalledWith(context)
    expect(adapters.auth).toEqual({
      feature: 'auth',
      baseUrl: 'https://api.example.com',
      queryClient: context.queryClient,
    })
    expect(adapters.products).toEqual({
      feature: 'products',
      telemetry: context.telemetry,
    })
  })

  it('nests feature providers in registry order and skips features without providers', () => {
    const registry = {
      auth: {
        createAdapters: () => ({ label: 'auth-adapter' }),
        renderProvider: ({ adapters, children }: { adapters: { label: string }; children: ReactNode }) => (
          <section data-testid="auth-provider" data-adapter={adapters.label}>
            {children}
          </section>
        ),
      },
      products: {
        createAdapters: () => ({ label: 'products-adapter' }),
        renderProvider: ({ adapters, children }: { adapters: { label: string }; children: ReactNode }) => (
          <section data-testid="products-provider" data-adapter={adapters.label}>
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
    const productsProvider = screen.getByTestId('products-provider')
    const leaf = screen.getByTestId('leaf')

    expect(authProvider).toContainElement(productsProvider)
    expect(productsProvider).toContainElement(leaf)
    expect(authProvider).toHaveAttribute('data-adapter', 'auth-adapter')
    expect(productsProvider).toHaveAttribute('data-adapter', 'products-adapter')
  })

  it('flattens routes from multiple registered features in registry order', () => {
    const registry = {
      auth: {
        createAdapters: () => ({ label: 'auth-adapter' }),
        routes: [{ path: '/auth', element: <div>auth</div> }],
      },
      products: {
        createAdapters: () => ({ label: 'products-adapter' }),
        routes: [
          { path: '/products', element: <div>products</div> },
          { path: '/products/:id', element: <div>detail</div> },
        ],
      },
    }

    expect(getFeatureRoutes(registry).map((route) => route.path)).toEqual([
      '/auth',
      '/products',
      '/products/:id',
    ])
  })

  it('collects navigation entries from registered features in registry order', () => {
    const registry = {
      auth: {
        createAdapters: () => ({ label: 'auth-adapter' }),
        navigation: { label: 'Auth', to: '/auth' },
      },
      products: {
        createAdapters: () => ({ label: 'products-adapter' }),
        navigation: { label: 'Products', to: '/products' },
      },
      analytics: {
        createAdapters: () => ({ label: 'analytics-adapter' }),
      },
    }

    expect(getFeatureNavigation(registry)).toEqual([
      { label: 'Auth', to: '/auth' },
      { label: 'Products', to: '/products' },
    ])
  })
})
