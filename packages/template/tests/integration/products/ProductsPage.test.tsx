import type { AppContainer } from '@app/composition/container'
import { ContainerContext } from '@app/composition/useContainer'
import {
  createAuthAdapters,
  createAuthUseCases,
  createInMemoryAuthRepository,
} from '@features/auth/api/composition'
import { ProductsPage } from '@features/products/api'
import {
  createInMemoryProductRepository,
  createProductAdapters,
  createProductUseCases,
  ProductAdaptersProvider,
} from '@features/products/api/composition'
import { ConsoleTelemetry } from '@shared/observability/ConsoleTelemetry'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

const createContainerFromFeaturePublicApis = (): AppContainer => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const telemetry = new ConsoleTelemetry()
  const authRepository = createInMemoryAuthRepository(telemetry)
  const authUseCases = createAuthUseCases(authRepository, telemetry)
  const authAdapters = createAuthAdapters({ useCases: authUseCases, queryClient })
  const productRepository = createInMemoryProductRepository([])
  const productUseCases = createProductUseCases(productRepository, telemetry)
  const productAdapters = createProductAdapters({ useCases: productUseCases, queryClient })

  return {
    queryClient,
    adapters: {
      auth: authAdapters,
      products: productAdapters,
    },
  }
}

const renderWithProviders = (ui: React.ReactElement) => {
  const container = createContainerFromFeaturePublicApis()

  return render(
    <ContainerContext.Provider value={container}>
      <QueryClientProvider client={container.queryClient}>
        <ProductAdaptersProvider adapters={container.adapters.products}>
          {ui}
        </ProductAdaptersProvider>
      </QueryClientProvider>
    </ContainerContext.Provider>,
  )
}

describe('ProductsPage integration', () => {
  it('can be composed in tests through feature public APIs only', async () => {
    renderWithProviders(<ProductsPage />)

    expect(screen.getByRole('heading', { name: /catalog demo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add product/i })).toBeEnabled()
  })

  it('lists products created from the screen', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductsPage />)

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Architecture coaching')
    await user.clear(screen.getByRole('spinbutton', { name: /price/i }))
    await user.type(screen.getByRole('spinbutton', { name: /price/i }), '150')
    await user.click(screen.getByRole('button', { name: /add product/i }))

    await waitFor(() => {
      expect(screen.getByText(/Architecture coaching/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/150\.00/)).toBeInTheDocument()
  })

  it('shows repository conflicts back to the user', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductsPage />)

    const nameInput = screen.getByRole('textbox', { name: /name/i })
    const priceInput = screen.getByRole('spinbutton', { name: /price/i })
    const submitButton = screen.getByRole('button', { name: /add product/i })

    await user.type(nameInput, 'Architecture coaching')
    await user.clear(priceInput)
    await user.type(priceInput, '150')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Architecture coaching/i)).toBeInTheDocument()
    })

    await user.type(nameInput, 'Architecture coaching')
    await user.clear(priceInput)
    await user.type(priceInput, '180')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/Conflict: A product with that name already exists/i),
      ).toBeInTheDocument()
    })
  })
})
