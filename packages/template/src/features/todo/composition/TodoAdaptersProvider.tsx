import type { ReactNode } from 'react'

import type { TodoAdapters } from '../adapters/todoAdapters'
import { TodoAdaptersContext } from './TodoAdaptersContext'

export const TodoAdaptersProvider = ({
  adapters,
  children,
}: {
  adapters: TodoAdapters
  children: ReactNode
}) => <TodoAdaptersContext.Provider value={adapters}>{children}</TodoAdaptersContext.Provider>
