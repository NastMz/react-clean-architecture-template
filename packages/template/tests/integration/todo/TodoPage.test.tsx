import type { AppContainer } from '@app/composition/container'
import { ContainerContext } from '@app/composition/useContainer'
import {
  createAuthAdapters,
  createAuthUseCases,
  createInMemoryAuthRepository,
} from '@features/auth/api/composition'
import { TodoPage } from '@features/todo/api'
import {
  createInMemoryTodoRepository,
  createTodoAdapters,
  createTodoUseCases,
  TodoAdaptersProvider,
} from '@features/todo/api/composition'
import { ConsoleTelemetry } from '@shared/observability/ConsoleTelemetry'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

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
        <TodoAdaptersProvider adapters={container.adapters.todo}>{ui}</TodoAdaptersProvider>
      </QueryClientProvider>
    </ContainerContext.Provider>,
  )
}

describe('TodoPage integration', () => {
  it('can create, complete, edit, and delete todos from feature public APIs only', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TodoPage />)

    await user.type(screen.getByRole('textbox', { name: /title/i }), 'Write integration tests')
    await user.click(screen.getByRole('button', { name: /add todo/i }))

    await waitFor(() => {
      expect(screen.getByRole('listitem', { name: /todo write integration tests/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('checkbox', { name: /mark write integration tests as complete/i }))

    await waitFor(() => {
      expect(screen.getByText(/Status: done/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /edit write integration tests/i }))
    const editField = screen.getByRole('textbox', { name: /edit title for write integration tests/i })
    await user.clear(editField)
    await user.type(editField, 'Write stronger integration tests')
    await user.click(screen.getByRole('button', { name: /save write stronger integration tests/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('listitem', { name: /todo write stronger integration tests/i }),
      ).toBeInTheDocument()
    })

    const todoItem = screen.getByRole('listitem', { name: /todo write stronger integration tests/i })
    await user.click(within(todoItem).getByRole('button', { name: /delete write stronger integration tests/i }))

    await waitFor(() => {
      expect(
        screen.queryByRole('listitem', { name: /todo write stronger integration tests/i }),
      ).not.toBeInTheDocument()
    })
  })

  it('composes dedicated create/list/item ui units while preserving todo behaviors', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TodoPage />)

    expect(screen.getByRole('form', { name: /create todo form/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /todo list panel/i })).toBeInTheDocument()
    expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: /title/i }), 'Split todo components')
    await user.click(screen.getByRole('button', { name: /add todo/i }))

    const item = await screen.findByRole('listitem', { name: /todo split todo components/i })
    expect(within(item).getByRole('button', { name: /edit split todo components/i })).toBeInTheDocument()
    expect(
      within(item).getByRole('checkbox', { name: /mark split todo components as complete/i }),
    ).toBeInTheDocument()
  })
})
