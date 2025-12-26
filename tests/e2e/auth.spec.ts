import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/auth')

    await expect(page.getByRole('heading', { name: /session demo/i })).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/auth')

    // Fill login form - use fill() which triggers proper React events
    await page.fill('input[name="email"]', 'demo@example.com')
    await page.fill('input[name="password"]', 'demo123')

    // Click the login button and wait for network to be idle
    await Promise.all([
      page.waitForLoadState('networkidle'),
      page.getByRole('button', { name: /^login$/i }).click(),
    ])

    // Wait for the logout button to appear (means login succeeded)
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('demo@example.com')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    await page.goto('/auth')

    // Login first
    await page.fill('input[name="email"]', 'demo@example.com')
    await page.fill('input[name="password"]', 'demo123')
    await Promise.all([
      page.waitForLoadState('networkidle'),
      page.getByRole('button', { name: /^login$/i }).click(),
    ])

    // Wait for logout button to confirm login
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible({ timeout: 5000 })

    // Logout
    await Promise.all([
      page.waitForLoadState('networkidle'),
      page.getByRole('button', { name: /logout/i }).click(),
    ])

    // Should see login form again
    await expect(page.getByRole('button', { name: /^login$/i })).toBeVisible({ timeout: 5000 })
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/auth')

    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpass')
    await Promise.all([
      page.waitForLoadState('networkidle'),
      page.getByRole('button', { name: /^login$/i }).click(),
    ])

    // Should show error message
    await expect(page.locator('text=/incorrect|invalid|error/i').first()).toBeVisible({
      timeout: 5000,
    })
  })
})
