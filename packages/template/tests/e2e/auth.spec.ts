import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'

const loginAsDemoUser = async (page: Page) => {
  await page.goto('/auth')
  await page.getByLabel(/email/i).fill('demo@example.com')
  await page.getByLabel(/password/i).fill('demo123')
  await page.getByRole('button', { name: /^login$/i }).click()
}

test.describe('Authentication Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/auth')

    await expect(page.getByRole('heading', { name: /session demo/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await loginAsDemoUser(page)

    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('demo@example.com')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    await loginAsDemoUser(page)

    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: /logout/i }).click()

    await expect(page.getByRole('button', { name: /^login$/i })).toBeVisible({ timeout: 5000 })
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/auth')

    await page.getByLabel(/email/i).fill('invalid@example.com')
    await page.getByLabel(/password/i).fill('wrongpass')
    await page.getByRole('button', { name: /^login$/i }).click()

    await expect(page.locator('text=/incorrect|invalid|error/i').first()).toBeVisible({
      timeout: 5000,
    })
  })

  test('redirects unauthenticated users from /todo to /auth', async ({ page }) => {
    await page.goto('/todo')

    await expect(page).toHaveURL(/\/auth/)
    await expect(page.getByRole('heading', { name: /session demo/i })).toBeVisible()
  })

  test('grants /todo after login and revokes access when session is cleared', async ({ page }) => {
    await loginAsDemoUser(page)

    await page.goto('/todo')
    await expect(page.getByRole('heading', { name: /todo board/i })).toBeVisible()

    await page.evaluate(() => {
      localStorage.removeItem('demo_session')
    })

    await page.reload()

    await expect(page).toHaveURL(/\/auth/)
    await expect(page.getByRole('heading', { name: /session demo/i })).toBeVisible()
  })
})
