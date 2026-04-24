import type { ReactElement } from 'react'
import type { RouteObject } from 'react-router-dom'

import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('AppRouter route configuration', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('points the index redirect to the registry entry route instead of visible navigation', async () => {
    let capturedRoutes: RouteObject[] = []

    vi.doMock('@app/extensions/registry', () => ({
      getAppDefaultRoute: () => '/invite',
      getAppFeatureNavigation: () => [{ label: 'Auth', to: '/auth' }],
      getAppFeatureRoutes: () => [{ path: '/invite', element: <div>invite landing</div> }],
    }))

    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

      return {
        ...actual,
        createBrowserRouter: (routes: RouteObject[]) => {
          capturedRoutes = routes
          return {} as ReturnType<typeof actual.createBrowserRouter>
        },
        RouterProvider: () => null,
      }
    })

    await import('@app/router/routes')

    const indexRedirect = capturedRoutes[0]?.children?.[0]?.element as ReactElement<{ to: string }>

    expect(capturedRoutes).toHaveLength(1)
    expect(capturedRoutes[0]?.children).toHaveLength(2)
    expect(capturedRoutes[0]?.children?.[0]?.index).toBe(true)
    expect(indexRedirect.props.to).toBe('/invite')
    expect(capturedRoutes[0]?.children?.[1]?.path).toBe('/invite')
  })

  it('derives auth+todo routes and navigation from registry outputs only', async () => {
    let capturedRoutes: RouteObject[] = []

    const featureNavigation = [
      { label: 'Auth', to: '/auth' },
      { label: 'Todo', to: '/todo' },
    ]

    vi.doMock('@app/extensions/registry', () => ({
      getAppDefaultRoute: () => '/auth',
      getAppFeatureNavigation: () => featureNavigation,
      getAppFeatureRoutes: () => [
        { path: '/auth', element: <div>auth</div> },
        { path: '/todo', element: <div>todo</div> },
      ],
    }))

    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

      return {
        ...actual,
        createBrowserRouter: (routes: RouteObject[]) => {
          capturedRoutes = routes
          return {} as ReturnType<typeof actual.createBrowserRouter>
        },
        RouterProvider: () => null,
      }
    })

    await import('@app/router/routes')

    const rootRoute = capturedRoutes[0]
    const rootElement = rootRoute?.element as ReactElement<{ navigationItems: typeof featureNavigation }>
    const childPaths = rootRoute?.children?.slice(1).map((route) => route.path)

    expect(rootElement.props.navigationItems).toEqual(featureNavigation)
    expect(childPaths).toEqual(['/auth', '/todo'])
    expect(rootRoute?.children?.[0]?.index).toBe(true)
  })
})
