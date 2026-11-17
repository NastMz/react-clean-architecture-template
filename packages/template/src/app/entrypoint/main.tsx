import '../styles/global.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { env } from '@/shared/config'

import { App } from './App'

/**
 * Starts the MSW mock backend when enabled. It is imported dynamically, so it
 * is never part of a production bundle that runs against a real API.
 */
const enableApiMocking = async () => {
  if (env.apiMocking !== 'enabled') {
    return
  }

  const { worker } = await import('../../../mocks/browser')
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found in index.html')
}

void enableApiMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
