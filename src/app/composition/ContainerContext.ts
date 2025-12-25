import { createContext } from 'react'

import type { AppContainer } from './container'

export const ContainerContext = createContext<AppContainer | null>(null)
