# Feature Playbook

Step-by-step guide to adding a new feature to this Clean Architecture template.

---

## Example: Adding a "Products" Feature

### Step 1: Create Folder Structure

```bash
mkdir -p src/features/products/{domain,application/ports,adapters,infra,ui}
```

### Step 2: Define Domain Model

**`src/features/products/domain/Product.ts`**

```ts
export type Product = {
  id: string
  name: string
  price: number
}

export type CreateProductInput = {
  name: string
  price: number
}
```

### Step 3: Define Repository Port

**`src/features/products/application/ports/ProductRepository.ts`**

```ts
import { AppError } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'
import { CreateProductInput, Product } from '../../domain/Product'

export interface ProductRepository {
  list(): Promise<Result<Product[], AppError>>
  create(input: CreateProductInput): Promise<Result<Product, AppError>>
}
```

### Step 4: Implement Use Cases

**`src/features/products/application/productUseCases.ts`**

```ts
import { AppError } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'
import { LoggerPort, TelemetryPort } from '@shared/application/ports/TelemetryPort'
import { ProductRepository } from './ports/ProductRepository'
import { CreateProductInput, Product } from '../domain/Product'

export type ProductUseCases = {
  listProducts(): Promise<Result<Product[], AppError>>
  createProduct(input: CreateProductInput): Promise<Result<Product, AppError>>
}

export const createProductUseCases = (
  repository: ProductRepository,
  telemetry: TelemetryPort & LoggerPort,
): ProductUseCases => ({
  async listProducts() {
    telemetry.track('product.list')
    return repository.list()
  },
  async createProduct(input) {
    telemetry.track('product.create', { name: input.name })
    return repository.create(input)
  },
})
```

### Step 5: Create Storybook Stories (Optional)

**`src/features/products/ui/stories/ProductsPage.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ProductsPage } from '../ProductsPage'

const meta = {
  title: 'Features/Products',
  component: ProductsPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ProductsPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <ProductsPage />,
}
```

### Step 6: Implement Repository (Infra)

**`src/features/products/infra/inMemoryProductRepository.ts`**

```ts
import { z } from 'zod'
import { AppErrorFactory } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'
import { ProductRepository } from '../application/ports/ProductRepository'
import { CreateProductInput, Product } from '../domain/Product'

const createProductInputSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
})

export const createInMemoryProductRepository = (): ProductRepository => {
  let products: Product[] = []

  return {
    async list() {
      return Result.ok([...products])
    },
    async create(input: CreateProductInput) {
      const parsed = createProductInputSchema.safeParse(input)
      if (!parsed.success) {
        return Result.err(AppErrorFactory.validation('Invalid product data'))
      }

      const newProduct: Product = {
        id: `${Date.now()}`,
        name: parsed.data.name,
        price: parsed.data.price,
      }

      products = [...products, newProduct]
      return Result.ok(newProduct)
    },
  }
}
```

### Step 6: Create Adapters (TanStack Query)

**`src/features/products/adapters/productAdapters.ts`**

```ts
import { mutationOptions, queryOptions, QueryClient } from '@tanstack/react-query'
import { AppError } from '@shared/domain/errors/AppError'
import { ProductUseCases } from '../application/productUseCases'
import { CreateProductInput, Product } from '../domain/Product'

export const productQueryKeys = {
  all: ['products'] as const,
}

export const createProductAdapters = ({
  useCases,
  queryClient,
}: {
  useCases: ProductUseCases
  queryClient: QueryClient
}) => {
  return {
    queries: {
      list: () =>
        queryOptions<Product[], AppError>({
          queryKey: productQueryKeys.all,
          queryFn: async () => (await useCases.listProducts()).unwrapOrThrow(),
        }),
    },
    mutations: {
      create: () =>
        mutationOptions<Product, AppError, CreateProductInput>({
          mutationFn: async (input) => (await useCases.createProduct(input)).unwrapOrThrow(),
          onSuccess: () => queryClient.invalidateQueries({ queryKey: productQueryKeys.all }),
        }),
    },
  }
}

export type ProductAdapters = ReturnType<typeof createProductAdapters>
```

### Step 7: Wire in Container

**`src/app/composition/container.ts`**

```ts
// ... existing imports
import { createProductUseCases } from '@features/products/application/productUseCases'
import { createInMemoryProductRepository } from '@features/products/infra/inMemoryProductRepository'
import { createProductAdapters, ProductAdapters } from '@features/products/adapters/productAdapters'

export type AppContainer = {
  queryClient: QueryClient
  adapters: {
    auth: AuthAdapters
    todo: TodoAdapters
    products: ProductAdapters // <-- add
  }
}

export const createContainer = (): AppContainer => {
  // ... existing setup

  const productRepository = createInMemoryProductRepository()
  const productUseCases = createProductUseCases(productRepository, telemetry)
  const productAdapters = createProductAdapters({ useCases: productUseCases, queryClient })

  return {
    queryClient,
    adapters: {
      auth: authAdapters,
      todo: todoAdapters,
      products: productAdapters, // <-- add
    },
  }
}
```

### Step 8: Build UI

**`src/features/products/ui/ProductsPage.tsx`**

```tsx
import { useMutation, useQuery } from '@tanstack/react-query'
import { useContainer } from '@app/composition/providers'
import { formatAppError } from '@shared/domain/errors/AppError'

export const ProductsPage = () => {
  const { adapters } = useContainer()
  const productsQuery = useQuery(adapters.products.queries.list())
  const createMutation = useMutation(adapters.products.mutations.create())

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    createMutation.mutate({
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
    })
  }

  return (
    <section className="panel">
      <h2>Products</h2>
      {productsQuery.error && <div className="alert">{formatAppError(productsQuery.error)}</div>}
      <form onSubmit={onSubmit}>
        <input name="name" placeholder="Product name" required />
        <input name="price" type="number" placeholder="Price" required />
        <button type="submit">Add</button>
      </form>
      <ul>
        {productsQuery.data?.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price}
          </li>
        ))}
      </ul>
    </section>
  )
}
```

### Step 9: Add Route

**`src/app/router/routes.tsx`**

```tsx
import { ProductsPage } from '@features/products/ui/ProductsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/auth" replace /> },
      { path: '/auth', element: <AuthPage /> },
      { path: '/todos', element: <TodoPage /> },
      { path: '/products', element: <ProductsPage /> }, // <-- add
    ],
  },
])
```

### Step 10: Write Tests

**`tests/unit/features/products/inMemoryProductRepository.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { createInMemoryProductRepository } from '@features/products/infra/inMemoryProductRepository'

describe('InMemoryProductRepository', () => {
  it('should create a product', async () => {
    const repo = createInMemoryProductRepository()
    const result = await repo.create({ name: 'Widget', price: 9.99 })
    expect(result.isOk).toBe(true)
    expect(result.value.name).toBe('Widget')
  })

  it('should list products', async () => {
    const repo = createInMemoryProductRepository()
    await repo.create({ name: 'Widget', price: 9.99 })
    const result = await repo.list()
    expect(result.value).toHaveLength(1)
  })
})
```

---

## Checklist

- [ ] Domain models defined
- [ ] Repository port defined
- [ ] Use cases implemented
- [ ] Infra repository implemented
- [ ] Adapters created (TanStack Query)
- [ ] Wired in container
- [ ] UI page built
- [ ] Route added
- [ ] Tests written
- [ ] ESLint passes (no boundary violations)

---

**Next**: [Testing Strategy](testing-strategy.md)
