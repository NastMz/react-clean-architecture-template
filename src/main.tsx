/**
 * Application entry point
 * Initializes the React application with providers and router
 */

import './index.css'

import { AppProviders } from '@app/composition/providers'
import { AppRouter } from '@app/router/routes'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
)
