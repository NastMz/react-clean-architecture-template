import { useContext } from 'react'

import { AuthAdaptersContext } from './AuthAdaptersContext'

export const useAuthAdapters = () => {
  const adapters = useContext(AuthAdaptersContext)

  if (!adapters) {
    throw new Error('Auth adapters must be provided within AppProviders')
  }

  return adapters
}
