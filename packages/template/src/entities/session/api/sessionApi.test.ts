import { describe, expect, it } from 'vitest'

import { authToken } from '@/shared/api'

import { getCurrentUser, login, logout } from './sessionApi'

const demoCredentials = { email: 'demo@example.com', password: 'demo123' }

describe('session api', () => {
  it('stores the token and returns the user on login', async () => {
    const user = await login(demoCredentials)

    expect(user).toEqual({ id: 'user-1', email: 'demo@example.com', name: 'Demo User' })
    expect(authToken.get()).toBeTruthy()
  })

  it('rejects wrong credentials without storing a token', async () => {
    await expect(login({ ...demoCredentials, password: 'nope' })).rejects.toMatchObject({
      status: 401,
      message: 'Invalid email or password',
    })
    expect(authToken.get()).toBeNull()
  })

  it('returns null without calling the API when there is no token', async () => {
    await expect(getCurrentUser()).resolves.toBeNull()
  })

  it('returns the current user for a valid token', async () => {
    await login(demoCredentials)

    await expect(getCurrentUser()).resolves.toMatchObject({ id: 'user-1' })
  })

  it('clears an invalid token and returns null', async () => {
    authToken.set('expired-token')

    await expect(getCurrentUser()).resolves.toBeNull()
    expect(authToken.get()).toBeNull()
  })

  it('clears the token on logout', async () => {
    await login(demoCredentials)

    await logout()

    expect(authToken.get()).toBeNull()
  })
})
