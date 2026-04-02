# Feature Playbook

This is the current, code-aligned way to add a feature to `packages/template`.

It is based on what the repo actually does today, not on a fantasy architecture diagram.

## First principle: features expose two public surfaces

For a feature named `products`, the target shape is:

```text
src/features/products/
  api/
    index.ts          # UI-facing public API
    composition.ts    # wiring/composition public API
  adapters/
  application/
  composition/        # optional provider/context/hooks for feature wiring
  domain/
  infra/
  ui/
```

Use the public surfaces like this:

- `@features/products/api`
  - for screens, app-level hooks, router consumption, and other external UI-facing usage
- `@features/products/api/composition`
  - for `src/app/composition/*`, providers, and tests

That is not optional busywork. It is how the current `auth` feature avoids mixing UI consumption with DI wiring.

## Current architectural constraints you must respect

### From `app`

- import features only through `@features/*/api` or `@features/*/api/composition`

### From `shared`

- never import from `@app/*`
- never import from `@features/*`

### Inside a feature

- `domain` stays pure
- `application` depends on `domain` and ports, not UI or infra
- `adapters` translate use cases into React Query query/mutation options
- `ui` consumes adapters/hooks, not infra or application directly
- `composition` holds provider/context glue when the feature needs React wiring

### One more honest caveat

The repo still proves these rules with only one real feature: `auth`. The top-level boundary rules are now generated for every directory under `src/features/*`, so a new feature inherits the same guardrails as long as it follows the standard folder shape.

## The current `shared` foundation

When you need common code, use the existing capability buckets:

- `@shared/contracts/*` for shared ports
- `@shared/kernel/*` for `Result` and `AppError`
- `@shared/network/*` for `HttpClient`, `RetryPolicy`, `CircuitBreaker`
- `@shared/observability/*` for telemetry adapters
- `@shared/ui/*` for shared layout and presentational components

Do not create a fake `shared/application` or `shared/infra` subtree just because an old doc said so.

## Recommended implementation order

### 1. Create the feature skeleton

Create these directories first:

```text
src/features/products/
  api/
  adapters/
  application/
  composition/
  domain/
  infra/
  ui/
```

If the feature does not need a provider/context yet, `composition/` can start empty.

### 2. Define domain types

Example:

```ts
// src/features/products/domain/Product.ts
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

Keep domain boring and framework-free.

### 3. Define application ports and use cases

Example repository port:

```ts
// src/features/products/application/ports/ProductRepository.ts
import type { AppError } from '@shared/kernel/AppError'
import type { Result } from '@shared/kernel/Result'

import type { CreateProductInput, Product } from '../../domain/Product'

export interface ProductRepository {
  list(): Promise<Result<Product[], AppError>>
  create(input: CreateProductInput): Promise<Result<Product, AppError>>
}
```

Example use cases:

```ts
// src/features/products/application/productUseCases.ts
import type { AppError } from '@shared/kernel/AppError'
import type { TelemetryPort, LoggerPort } from '@shared/contracts/TelemetryPort'
import { Result } from '@shared/kernel/Result'

import type { CreateProductInput, Product } from '../domain/Product'
import type { ProductRepository } from './ports/ProductRepository'

export interface ProductUseCases {
  listProducts(): Promise<Result<Product[], AppError>>
  createProduct(input: CreateProductInput): Promise<Result<Product, AppError>>
}

export const createProductUseCases = (
  repository: ProductRepository,
  telemetry: TelemetryPort & LoggerPort,
) => ({
  async listProducts() {
    telemetry.track('products.list.attempt')
    return repository.list()
  },
  async createProduct(input: CreateProductInput) {
    telemetry.track('products.create.attempt', { name: input.name })
    return repository.create(input)
  },
})
```

The example above is intentionally simple. Match the actual `Result<AppError>` pattern used by `auth` in real code.

### 4. Start with an in-memory repository

This repo already proves that in-memory first is useful for UI work and tests.

Example:

```ts
// src/features/products/infra/inMemoryProductRepository.ts
import type { ProductRepository } from '../application/ports/ProductRepository'
import type { CreateProductInput, Product } from '../domain/Product'

import { AppErrorFactory } from '@shared/kernel/AppError'
import { Result } from '@shared/kernel/Result'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
})

export const createInMemoryProductRepository = (): ProductRepository => {
  let products: Product[] = []

  return {
    async list() {
      return Result.ok(products)
    },
    async create(input: CreateProductInput) {
      const parsed = createProductSchema.safeParse(input)
      if (!parsed.success) {
        return Result.err(AppErrorFactory.validation('Invalid product payload'))
      }

      const product: Product = {
        id: crypto.randomUUID(),
        name: parsed.data.name,
        price: parsed.data.price,
      }

      products = [...products, product]
      return Result.ok(product)
    },
  }
}
```

### 5. Add adapters for React Query

The current template uses an adapter factory plus UI-facing hooks.

Example:

```ts
// src/features/products/adapters/productAdapters.ts
import type { AppError } from '@shared/kernel/AppError'
import type { QueryClient } from '@tanstack/react-query'
import { mutationOptions, queryOptions } from '@tanstack/react-query'

import type { ProductUseCases } from '../application/productUseCases'
import type { CreateProductInput, Product } from '../domain/Product'

export const productQueryKeys = {
  all: ['products'] as const,
}

export const createProductAdapters = ({
  useCases,
  queryClient,
}: {
  useCases: ProductUseCases
  queryClient: QueryClient
}) => ({
  queries: {
    list: () =>
      queryOptions<Product[]>({
        queryKey: productQueryKeys.all,
        queryFn: async () => (await useCases.listProducts()).unwrapOrThrow(),
      }),
  },
  mutations: {
    create: () =>
      mutationOptions<Product, AppError, CreateProductInput>({
        mutationFn: async (input) => (await useCases.createProduct(input)).unwrapOrThrow(),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: productQueryKeys.all })
        },
      }),
  },
})

export type ProductAdapters = ReturnType<typeof createProductAdapters>
```

If the feature needs React hooks, expose them through UI-facing files or the feature public API. Do not make app code pull from adapter internals directly.

### 6. Add composition glue only if the feature needs it

`auth` needs a provider/context because `useLogin`, `useLogout`, and `useSession` read adapters from feature-local composition state.

If your feature needs the same pattern, create:

- `composition/<Feature>AdaptersContext.ts`
- `composition/<Feature>AdaptersProvider.tsx`
- `composition/use<Feature>Adapters.ts`

If not, do not invent composition files for sport.

### 7. Expose the feature through `api/index.ts`

UI-facing example:

```ts
// src/features/products/api/index.ts
export { ProductsPage } from '../ui/ProductsPage'
export { useCreateProduct, useProducts } from '../ui/productHooks'
```

The goal is simple: app code should not need to know your internal folders.

### 8. Expose the wiring surface through `api/composition.ts`

Composition-facing example:

```ts
// src/features/products/api/composition.ts
export type { ProductAdapters } from '../adapters/productAdapters'
export { createProductAdapters } from '../adapters/productAdapters'
export { createProductUseCases } from '../application/productUseCases'
export { createInMemoryProductRepository } from '../infra/inMemoryProductRepository'
export { createHttpProductRepository } from '../infra/httpProductRepository'
```

Only export what composition root and tests actually need.

### 9. Register the feature in `src/app/extensions/registry.tsx`

Current app composition reads from a single registry instead of wiring each feature in three separate files.

Create a feature extension file in `src/app/extensions/<feature>.tsx` and register it in `src/app/extensions/registry.tsx`.

Use `entryRoute` for the feature route that can represent `/`.

- `entryRoute` controls the landing/default redirect for the app shell.
- `navigation` controls visible menu items in `RootLayout`.
- Keep at most one `entryRoute.isDefault: true` across the whole registry or the app will fail fast during registry resolution.

Example:

```ts
// src/app/extensions/products.tsx
import { ProductsPage } from '@features/products/api'
import {
  ProductsAdaptersProvider,
  createInMemoryProductRepository,
  createProductAdapters,
  createProductUseCases,
} from '@features/products/api/composition'

export const productsFeature = {
  createAdapters: ({ queryClient, telemetry }) => {
    const repository = createInMemoryProductRepository()
    const useCases = createProductUseCases(repository, telemetry)

    return createProductAdapters({ useCases, queryClient })
  },
  renderProvider: ({ adapters, children }) => (
    <ProductsAdaptersProvider adapters={adapters}>{children}</ProductsAdaptersProvider>
  ),
  routes: [{ path: '/products', element: <ProductsPage /> }],
  entryRoute: { to: '/products' },
  navigation: { label: 'Products', to: '/products' },
}

// src/app/extensions/registry.tsx
export const appFeatureRegistry = {
  auth: authFeature,
  products: productsFeature,
} as const
```

`container.ts`, `providers.tsx`, and `routes.tsx` pick up the feature from that registry automatically. If a route should be the landing page but should not appear in shell navigation, define `entryRoute` without `navigation`.

### 10. Keep UI and routes on the public API

Router example:

```tsx
import { ProductsPage } from '@features/products/api'

{ path: '/products', element: <ProductsPage /> }
```

Do not import `@features/products/ui/ProductsPage` from app code. That is exactly the kind of boundary leak this template is trying to avoid.

### 11. Add tests early

At minimum:

- unit test the in-memory repository
- unit test the HTTP repository if you add one
- integration test the main feature screen
- add E2E only when the flow is stable enough to justify it

Today the template proves these patterns with auth, env/config, shared network utilities, and route protection. Extend that style instead of inventing a second testing philosophy.

## HTTP repository guidance

If you add an HTTP repository, use the existing shared primitives honestly:

- `@shared/network/HttpClient`
- `@shared/network/RetryPolicy`
- `@shared/network/CircuitBreaker`

Important reality check:

- `RetryPolicy` is already used by `auth`
- `CircuitBreaker` exists but is not currently wired into `auth`

So if you add circuit breaker support to a new feature, document it as your feature's decision, not as an existing template-wide default.

## Feature checklist

- [ ] created `domain`, `application`, `adapters`, `infra`, `ui`, and `api`
- [ ] added `composition` only if the feature actually needs React wiring helpers
- [ ] kept app imports on `@features/<feature>/api` or `@features/<feature>/api/composition`
- [ ] kept `shared` independent from app/features
- [ ] started with an in-memory repository where possible
- [ ] added adapter factory and query keys
- [ ] exposed a UI-facing public API
- [ ] exposed a composition-facing public API
- [ ] registered the feature in `src/app/extensions/registry.tsx`
- [ ] declared `entryRoute` for any route that can be used as the app landing redirect
- [ ] kept route(s) on the feature public API
- [ ] added tests before calling the pattern "done"
- [ ] checked whether `eslint.config.js` needs to be extended for the new feature

## Final warning

The template is small enough that one sloppy feature can ruin the architecture fast.

If your new feature starts importing app internals, bypasses the public API split, or dumps framework code into `application`, you are not extending the template. You are punching holes in it.
