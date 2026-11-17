import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../../../../test/render'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('validates fields before calling the API', async () => {
    const onSuccess = vi.fn()
    const { user } = renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    await user.click(await screen.findByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('shows the server error for wrong credentials', async () => {
    const { user } = renderWithProviders(<LoginForm />)

    await user.type(await screen.findByLabelText('Email'), 'demo@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
  })

  it('calls onSuccess with the user after a successful login', async () => {
    const onSuccess = vi.fn()
    const { user } = renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    await user.type(await screen.findByLabelText('Email'), 'demo@example.com')
    await user.type(screen.getByLabelText('Password'), 'demo123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce()
    })
    expect(onSuccess.mock.calls[0]?.[0]).toMatchObject({ email: 'demo@example.com' })
  })
})
