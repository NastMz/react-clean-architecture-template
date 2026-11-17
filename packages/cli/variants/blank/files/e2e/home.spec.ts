import { expect, test } from '@playwright/test'

test('shows the home page', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible()
})

test('shows the not-found page for unknown paths', async ({ page }) => {
  await page.goto('/does-not-exist')

  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
})
