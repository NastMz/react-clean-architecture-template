import type { AppContainer } from '@app/composition/container'
import { ContainerContext } from '@app/composition/useContainer'
import { AuthPage } from '@features/auth/api'
import {
  AuthAdaptersProvider,
  createAuthAdapters,
  createAuthUseCases,
  createInMemoryAuthRepository,
} from '@features/auth/api/composition'
import { ConsoleTelemetry } from '@shared/observability/ConsoleTelemetry'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'

const createTestContainer = (): AppContainer => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const telemetry = new ConsoleTelemetry()
  const authRepository = createInMemoryAuthRepository(telemetry)
  const authUseCases = createAuthUseCases(authRepository, telemetry)
  const authAdapters = createAuthAdapters({ useCases: authUseCases, queryClient })

  return {
    queryClient,
    adapters: {
      auth: authAdapters,
    },
  }
}

const renderWithProviders = (ui: React.ReactElement) => {
  const container = createTestContainer()
  return render(
    <ContainerContext.Provider value={container}>
      <QueryClientProvider client={container.queryClient}>
        <AuthAdaptersProvider adapters={container.adapters.auth}>{ui}</AuthAdaptersProvider>
      </QueryClientProvider>
    </ContainerContext.Provider>,
  )
}

describe('AuthPage integration', () => {
  beforeEach(() => {
    // Clear localStorage between tests to avoid session persistence
    localStorage.clear()
  })

  it('should log in successfully with valid credentials', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage />)

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getByLabelText(/password/i)
    const loginButton = screen.getByRole('button', { name: /login/i })

    await user.clear(emailInput)
    await user.type(emailInput, 'demo@example.com')
    await user.clear(passwordInput)
    await user.type(passwordInput, 'demo123')
    await user.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/Demo User/i)).toBeInTheDocument()
    })
  })

  it('should show error on invalid credentials', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage />)

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getByLabelText(/password/i)
    const loginButton = screen.getByRole('button', { name: /login/i })

    // Triple click to select all and then type to replace
    await user.tripleClick(emailInput)
    await user.keyboard('wrong@example.com')
    await user.tripleClick(passwordInput)
    await user.keyboard('wrong')
    await user.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/Validation.*Credenciales/i)).toBeInTheDocument()
    })
  })
})
