import type { AppContainer } from '@app/composition/container'
import { ContainerContext } from '@app/composition/useContainer'
import { AuthPage } from '@features/auth/api'
import {
  AuthAdaptersProvider,
  createAuthAdapters,
  createAuthUseCases,
  createInMemoryAuthRepository,
} from '@features/auth/api/composition'
import {
  createInMemoryTodoRepository,
  createTodoAdapters,
  createTodoUseCases,
} from '@features/todo/api/composition'
import { ConsoleTelemetry } from '@shared/observability/ConsoleTelemetry'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { describe, expect, it, beforeEach } from 'vitest'

const createContainerFromFeaturePublicApis = (): AppContainer => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const telemetry = new ConsoleTelemetry()
  const authRepository = createInMemoryAuthRepository(telemetry)
  const authUseCases = createAuthUseCases(authRepository, telemetry)
  const authAdapters = createAuthAdapters({ useCases: authUseCases, queryClient })
  const todoRepository = createInMemoryTodoRepository([])
  const todoUseCases = createTodoUseCases(todoRepository, telemetry)
  const todoAdapters = createTodoAdapters({ useCases: todoUseCases, queryClient })

  return {
    queryClient,
    adapters: {
      auth: authAdapters,
      todo: todoAdapters,
    },
  }
}

const renderWithProviders = (ui: ReactElement) => {
  const container = createContainerFromFeaturePublicApis()
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

  it('shows required field errors when login fields are empty', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage />)

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getByLabelText(/password/i)
    const loginForm = screen.getByRole('form', { name: /auth login form/i })

    await user.clear(emailInput)
    await user.clear(passwordInput)
    fireEvent.submit(loginForm)

    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('can be composed in tests through feature public APIs only', async () => {
    renderWithProviders(<AuthPage />)

    expect(screen.getByRole('heading', { name: /session demo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeEnabled()
  })

  it('keeps container orchestration while composing login form and session panel units', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage />)

    expect(screen.getByRole('form', { name: /auth login form/i })).toBeInTheDocument()

    await user.clear(screen.getByRole('textbox', { name: /email/i }))
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'demo@example.com')
    await user.clear(screen.getByLabelText(/password/i))
    await user.type(screen.getByLabelText(/password/i), 'demo123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    const sessionPanel = await screen.findByRole('region', { name: /authenticated session panel/i })
    expect(within(sessionPanel).getByText(/demo user/i)).toBeInTheDocument()

    await user.click(within(sessionPanel).getByRole('button', { name: /logout/i }))

    await waitFor(() => {
      expect(screen.getByRole('form', { name: /auth login form/i })).toBeInTheDocument()
    })
  })
})
