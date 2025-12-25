import type { AppContainer } from '@app/composition/container'
import { ContainerContext } from '@app/composition/useContainer'
import { createAuthAdapters } from '@features/auth/adapters/authAdapters'
import { createAuthUseCases } from '@features/auth/application/authUseCases'
import { createInMemoryAuthRepository } from '@features/auth/infra/inMemoryAuthRepository'
import { AuthPage } from '@features/auth/ui/AuthPage'
import { ConsoleTelemetry } from '@shared/infra/telemetry/ConsoleTelemetry'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

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
      todo: {} as never,
    },
  }
}

const renderWithProviders = (ui: React.ReactElement) => {
  const container = createTestContainer()
  return render(
    <ContainerContext.Provider value={container}>
      <QueryClientProvider client={container.queryClient}>{ui}</QueryClientProvider>
    </ContainerContext.Provider>,
  )
}

describe('AuthPage integration', () => {
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

    await user.clear(emailInput)
    await user.type(emailInput, 'wrong@example.com')
    await user.clear(passwordInput)
    await user.type(passwordInput, 'wrong')
    await user.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/Validation.*Credenciales/i)).toBeInTheDocument()
    })
  })
})
