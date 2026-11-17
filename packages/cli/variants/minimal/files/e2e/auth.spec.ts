import { expect, type Page, test } from '@playwright/test'

const signIn = async (page: Page, password = 'demo123') => {
  await page.getByLabel('Email').fill('demo@example.com')
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

test('rejects invalid credentials', async ({ page }) => {
  await page.goto('/login')

  await signIn(page, 'wrong-password')

  await expect(page.getByRole('alert')).toHaveText('Invalid email or password')
})

test('signs in, keeps the session on reload and signs out', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login\?redirectTo=/)

  await signIn(page)
  await expect(page.getByRole('heading', { name: 'Welcome, Demo User' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Welcome, Demo User' })).toBeVisible()

  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
})
