import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { createContainer } from './container'
import { ContainerContext } from './ContainerContext'

export const AppProviders = ({ children }: { children: ReactNode }) => {
  const container = useMemo(() => createContainer(), [])

  return (
    <ContainerContext.Provider value={container}>
      <QueryClientProvider client={container.queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ContainerContext.Provider>
  )
}
