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
  await expect(page).toHaveURL(/\/login/)
})

test('returns to the requested page after signing in', async ({ page }) => {
  await page.goto('/todos/todo-2')
  await expect(page).toHaveURL(/\/login\?redirectTo=/)

  await signIn(page)

  await expect(page.getByRole('heading', { name: 'Read the architecture guide' })).toBeVisible()
})

test('manages a todo from creation to deletion', async ({ page }) => {
  const title = 'Write an end-to-end test'
  await page.goto('/')
  await signIn(page)
  await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible()

  await page.getByLabel('New todo').fill(title)
  await page.getByRole('button', { name: 'Add todo' }).click()
  await expect(page.getByText(title, { exact: true })).toBeVisible()

  await page.getByRole('checkbox', { name: `Mark "${title}" as done` }).click()
  await expect(page.getByRole('checkbox', { name: `Mark "${title}" as open` })).toBeChecked()

  await page.getByRole('link', { name: `Details for ${title}` }).click()
  await page.getByLabel('Title').fill('Write E2E tests')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByRole('heading', { name: 'Write E2E tests' })).toBeVisible()

  await page.getByRole('button', { name: 'Delete todo' }).click()
  await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible()
  await expect(page.getByText('Write E2E tests', { exact: true })).toHaveCount(0)

  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
})
