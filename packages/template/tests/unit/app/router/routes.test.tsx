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
})
