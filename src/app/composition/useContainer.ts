import { useContext } from 'react'

import type { AppContainer } from './container'
import { ContainerContext } from './ContainerContext'

export { ContainerContext }

/**
 * Custom React hook for accessing the DI container
 * @throws {Error} If used outside of AppProviders context
 * @returns The application DI container with all dependencies
 */
export const useContainer = (): AppContainer => {
  const ctx = useContext(ContainerContext)
  if (!ctx) throw new Error('useContainer must be used within AppProviders')
  return ctx
}
