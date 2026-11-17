import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderApp } from '../../../test/render'

describe('app routes', () => {
  it('redirects anonymous users to login and remembers where they were going', async () => {
    const { router } = renderApp('/todos/todo-2')

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(router.state.location.search).toBe('?redirectTo=%2Ftodos%2Ftodo-2')
  })

  it('signs in and continues to the requested page', async () => {
    const { user, router } = renderApp('/todos/todo-2')

    await user.type(await screen.findByLabelText('Email'), 'demo@example.com')
    await user.type(screen.getByLabelText('Password'), 'demo123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByRole('heading', { name: 'Read the architecture guide' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/todos/todo-2')
  })

  it('sends signed-in users from the login page to their todos', async () => {
    const { router } = renderApp('/login', { signedIn: true })

    expect(await screen.findByRole('heading', { name: 'Todos' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/todos')
  })

  it('signs out and returns to the login page', async () => {
    const { user } = renderApp('/todos', { signedIn: true })

    await user.click(await screen.findByRole('button', { name: 'Sign out' }))

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.queryByText('Demo User')).not.toBeInTheDocument()
  })

  it('renders the not-found page for unknown paths', async () => {
    renderApp('/does-not-exist')

    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })

  it('renders the error boundary when a todo does not exist', async () => {
    renderApp('/todos/missing', { signedIn: true })

    expect(await screen.findByRole('heading', { name: 'Not found' })).toBeInTheDocument()
  })
})
