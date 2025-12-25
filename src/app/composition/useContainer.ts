import { useContext } from 'react'

import type { AppContainer } from './container'
import { ContainerContext } from './ContainerContext'

export { ContainerContext }

export const useContainer = (): AppContainer => {
  const ctx = useContext(ContainerContext)
  if (!ctx) throw new Error('useContainer must be used within AppProviders')
  return ctx
}
