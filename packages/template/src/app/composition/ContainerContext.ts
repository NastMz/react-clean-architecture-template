import { createContext } from 'react'

import type { AppContainer } from './container'

/**
 * React Context for providing the DI container throughout the application
 * Contains all dependencies and use cases needed by features
 * Should be wrapped with ContainerContext.Provider at the app root
 */
export const ContainerContext = createContext<AppContainer | null>(null)
