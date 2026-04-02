import { AuthPage } from '@features/auth/api'
import {
  AuthAdaptersProvider,
  createAuthAdapters,
  createAuthUseCases,
  createHttpAuthRepository,
  createInMemoryAuthRepository,
} from '@features/auth/api/composition'
import { createFetchHttpClient } from '@shared/network/HttpClient'
import { z } from 'zod'

import type { AppFeatureDefinition } from './contracts'

const refreshTokenResponseSchema = z.object({
  accessToken: z.string().min(1),
})

export const authFeature = {
  createAdapters: ({ config, queryClient, telemetry }) => {
    const authRepository = (() => {
      if (config.authRepositoryType === 'memory') {
        return createInMemoryAuthRepository(telemetry)
      }

      const baseUrl = config.apiBaseUrl
      const refreshClient = createFetchHttpClient({ baseUrl })

      const httpClient = createFetchHttpClient({
        baseUrl,
        getAuthToken: () =>
          typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null,
        onRequest: (request) => ({
          ...request,
          headers: { ...request.headers, 'X-App': 'clean-template' },
        }),
        onResponse: ({ request, status, durationMs }) => {
          if (typeof window !== 'undefined') {
            console.info(
              `[http] ${request.method} ${request.url} -> ${status} in ${durationMs.toFixed(0)}ms`,
            )
          }
        },
        refreshToken: async () => {
          const result = await refreshClient.request<{ accessToken: string }>({
            method: 'POST',
            url: '/auth/refresh',
            skipInterceptors: true,
            responseSchema: refreshTokenResponseSchema,
          })

          return result.match({
            ok: ({ data }) => {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('access_token', data.accessToken)
              }

              return data.accessToken
            },
            err: () => null,
          })
        },
      })

      return createHttpAuthRepository(httpClient, telemetry, { baseUrl })
    })()

    const authUseCases = createAuthUseCases(authRepository, telemetry)
    return createAuthAdapters({ useCases: authUseCases, queryClient })
  },
  renderProvider: ({ adapters, children }) => (
    <AuthAdaptersProvider adapters={adapters}>{children}</AuthAdaptersProvider>
  ),
  routes: [{ path: '/auth', element: <AuthPage /> }],
  entryRoute: { to: '/auth', isDefault: true },
  navigation: { label: 'Auth', to: '/auth' },
} satisfies AppFeatureDefinition<ReturnType<typeof createAuthAdapters>>
