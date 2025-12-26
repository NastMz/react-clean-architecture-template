# Testing Strategy

How to test each layer of the Clean Architecture stack.

---

## Test Pyramid

1. **Unit tests** (domain, use cases, infra implementations)
2. **Integration tests** (adapters + UI)
3. **E2E tests** (Playwright, future)

---

## Layer-by-Layer Testing

### 1. Domain (Pure Logic)

**What to test:**

- Value objects
- Domain rules
- `Result` / `AppError` logic

**Example:**

```ts
import { describe, expect, it } from 'vitest'
import { Result } from '@shared/domain/result/Result'

describe('Result', () => {
  it('should map Ok values', () => {
    const result = Result.ok(5).map((n) => n * 2)
    expect(result.value).toBe(10)
  })
})
```

**No mocks needed** – domain is pure.

---

### 2. Application (Use Cases)

**What to test:**

- Use case orchestration
- Error handling
- Telemetry calls

**Example:**

```ts
import { describe, expect, it, vi } from 'vitest'
import { createAuthUseCases } from '@features/auth/application/authUseCases'
import { Result } from '@shared/domain/result/Result'

describe('authUseCases', () => {
  it('should call telemetry on login success', async () => {
    const mockRepo = {
      login: vi.fn().mockResolvedValue(Result.ok({ user: {}, token: 'abc' })),
      logout: vi.fn(),
      currentSession: vi.fn(),
    }
    const mockTelemetry = { track: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }

    const useCases = createAuthUseCases(mockRepo, mockTelemetry)
    await useCases.login({ email: 'test@example.com', password: 'pass' })

    expect(mockTelemetry.track).toHaveBeenCalledWith('auth.login.attempt', expect.any(Object))
    expect(mockTelemetry.track).toHaveBeenCalledWith('auth.login.success', expect.any(Object))
  })
})
```

**Use fake repos** (simple mocks).

---

### 3. Infra (Repository Implementations)

**What to test:**

- Validation (Zod schemas)
- State mutations (in-memory)
- HTTP calls (with fetch mock or MSW)

**Example:**

```ts
import { describe, expect, it } from 'vitest'
import { createInMemoryAuthRepository } from '@features/auth/infra/inMemoryAuthRepository'

describe('InMemoryAuthRepository', () => {
  it('should login with valid credentials', async () => {
    const repo = createInMemoryAuthRepository({
      track: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    })
    const result = await repo.login({ email: 'demo@example.com', password: 'demo123' })
    expect(result.isOk).toBe(true)
  })
})
```

---

### 4. Adapters (TanStack Query)

**What to test:**

- Query key correctness
- Mutation success/error handling
- Cache invalidation
- Exported hooks work correctly

**Example:**

```ts
import { describe, expect, it, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { createAuthAdapters } from '@features/auth/adapters/authAdapters'
import { Result } from '@shared/domain/result/Result'

describe('authAdapters', () => {
  it('should invalidate cache on logout', async () => {
    const queryClient = new QueryClient()
    const mockUseCases = {
      login: vi.fn(),
      logout: vi.fn().mockResolvedValue(Result.ok(undefined)),
      currentSession: vi.fn(),
    }

    const adapters = createAuthAdapters({ useCases: mockUseCases, queryClient })
    const mutation = adapters.mutations.logout()

    await mutation.mutationFn()
    // Check cache is set to null after logout
    expect(queryClient.getQueryData(['auth', 'session'])).toBeNull()
  })
})
```

---

### 5. UI (Integration Tests)

**What to test:**

- User flows (login, logout)
- Error display
- Loading states
- Components use hooks correctly (not useContainer)

**Example:**

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthPage } from '@features/auth/ui/AuthPage'

describe('AuthPage integration', () => {
  it('should log in successfully with valid credentials', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage />)

    await user.type(screen.getByLabelText(/email/i), 'demo@example.com')
    await user.type(screen.getByLabelText(/password/i), 'demo123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/Demo User/i)).toBeInTheDocument()
    })
  })

  it('should show error on invalid credentials', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage />)

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})
```

**Use real adapters + container**, with in-memory repositories for fast tests.

---

## Test Helpers

### `renderWithProviders`

```tsx
const createTestContainer = (): AppContainer => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  // ... wire up features
  return { queryClient, adapters: { ... } }
}

const renderWithProviders = (ui: React.ReactElement) => {
  const container = createTestContainer()
  return render(
    <ContainerContext.Provider value={container}>
      <QueryClientProvider client={container.queryClient}>{ui}</QueryClientProvider>
    </ContainerContext.Provider>,
  )
}
```

---

## Coverage Goals

- **Domain**: 100% (easy, pure functions)
- **Application**: 80%+ (use cases)
- **Infra**: 70%+ (focus on critical paths)
- **Adapters**: 60%+ (query/mutation logic)
- **UI**: 50%+ (happy paths + error cases)

---

## Running Tests

```bash
pnpm test          # run all
pnpm test:watch    # watch mode
pnpm test -- --coverage  # coverage report
```

---

## E2E Tests (Future: Playwright)

1. Install Playwright: `pnpm add -D @playwright/test`
2. Add `tests/e2e/auth.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('login flow', async ({ page }) => {
  await page.goto('http://localhost:5173/auth')
  await page.fill('input[name="email"]', 'demo@example.com')
  await page.fill('input[name="password"]', 'demo123')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Demo User')).toBeVisible()
})
```

3. Run: `pnpm playwright test`

---

**Next**: [Architecture Guide](architecture.md)
