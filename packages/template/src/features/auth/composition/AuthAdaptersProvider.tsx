import type { AuthAdapters } from '@features/auth/adapters/authAdapters'
import type { ReactNode } from 'react'

import { AuthAdaptersContext } from './AuthAdaptersContext'

export const AuthAdaptersProvider = ({
  adapters,
  children,
}: {
  adapters: AuthAdapters
  children: ReactNode
}) => <AuthAdaptersContext.Provider value={adapters}>{children}</AuthAdaptersContext.Provider>
