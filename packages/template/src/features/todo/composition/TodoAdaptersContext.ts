import { createContext } from 'react'

import type { TodoAdapters } from '../adapters/todoAdapters'

export const TodoAdaptersContext = createContext<TodoAdapters | null>(null)
