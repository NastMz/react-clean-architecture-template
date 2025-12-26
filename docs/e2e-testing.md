# E2E Testing with Playwright

This project uses **Playwright** for end-to-end (E2E) testing, providing automated browser testing for critical user flows.

## Configuration

Playwright is configured in [playwright.config.ts](../playwright.config.ts) with:

- **Test directory**: `tests/e2e/`
- **Base URL**: `http://localhost:5173`
- **Browser**: Chromium (Desktop Chrome)
- **Auto-starts dev server** before running tests
- **Screenshots**: Only on failure
- **Trace**: On first retry

## Running Tests

```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Run with UI mode (interactive)
pnpm test:e2e:ui

# Show test report
pnpm test:e2e:report
```

## Test Structure

### Authentication Tests

[tests/e2e/auth.spec.ts](../tests/e2e/auth.spec.ts) covers:

- ✅ Display login form
- ✅ Login with valid credentials
- ✅ Logout successfully
- ✅ Show error with invalid credentials

These tests validate the complete authentication flow using the in-memory repository.

## Writing New Tests

Create a new test file in `tests/e2e/`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/feature')

    await expect(page.getByRole('heading')).toBeVisible()
  })
})
```

## CI/CD Integration

E2E tests run automatically in GitHub Actions:

- Runs after unit tests and linting
- Installs Playwright browsers in CI environment
- Uploads test reports on failure
- Reports retained for 7 days

## Best Practices

1. **Use semantic selectors**: Prefer `getByRole`, `getByLabel`, `getByPlaceholder` over CSS selectors
2. **Wait for visibility**: Use `toBeVisible()` with timeouts for async operations
3. **Test user flows**: Focus on critical paths (auth, main features)
4. **Keep tests isolated**: Each test should be independent
5. **Use Page Object Model**: For complex pages, extract selectors and actions

## Debugging

```bash
# Run with debug mode
pnpm test:e2e --debug

# Run specific test file
pnpm test:e2e auth.spec.ts

# Run with headed browser
pnpm test:e2e --headed
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)
