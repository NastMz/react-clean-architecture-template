import { AuthPage } from '@features/auth/api'
import {
  AuthAdaptersProvider,
  createAuthAdapters,
  createAuthUseCases,
  createInMemoryAuthRepository,
} from '@features/auth/api/composition'

import { defineAppFeature } from './contracts'

export const authFeature = defineAppFeature({
  createAdapters: ({ queryClient, telemetry }) => {
    const authRepository = createInMemoryAuthRepository(telemetry)
    const authUseCases = createAuthUseCases(authRepository, telemetry)
    return createAuthAdapters({ useCases: authUseCases, queryClient })
  },
  renderProvider: ({ adapters, children }) => (
    <AuthAdaptersProvider adapters={adapters}>{children}</AuthAdaptersProvider>
  ),
  routes: [{ path: '/auth', element: <AuthPage /> }],
  entryRoute: { to: '/auth', isDefault: true },
  navigation: { label: 'Auth', to: '/auth' },
})
