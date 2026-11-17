import '../styles/global.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'

import { env } from '@/shared/config'

import { createQueryClient } from '../cache/query-client'
import { createRoutes } from '../routes/routes'
import { App } from './App'

/**
 * Starts the MSW mock backend when enabled. It is imported dynamically, so it
 * is only downloaded when mocking is on.
 */
const enableApiMocking = async () => {
  if (env.apiMocking !== 'enabled') {
    return
  }

  const { worker } = await import('../../../mocks/browser')
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
}

const bootstrap = async () => {
  const rootElement = document.getElementById('root')

  if (!rootElement) {
    throw new Error('Root element #root not found in index.html')
  }

  // The router starts its first navigation (middleware and loaders) as soon as
  // it is created, so it must be created only after the mock backend is ready.
  await enableApiMocking()

  const queryClient = createQueryClient()
  const router = createBrowserRouter(createRoutes(queryClient))

  createRoot(rootElement).render(
    <StrictMode>
      <App queryClient={queryClient} router={router} />
    </StrictMode>,
  )
}

void bootstrap()
