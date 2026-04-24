import { useContext } from 'react'

import { TodoAdaptersContext } from './TodoAdaptersContext'

export const useTodoAdapters = () => {
  const adapters = useContext(TodoAdaptersContext)

  if (!adapters) {
    throw new Error('useTodoAdapters must be used within TodoAdaptersProvider')
  }

  return adapters
}
