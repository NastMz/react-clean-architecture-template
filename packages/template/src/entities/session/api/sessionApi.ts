import { z } from 'zod'

import { apiClient, authToken, isApiError } from '@/shared/api'

import { authResponseSchema, type Credentials, type User, userSchema } from '../model/session'

export const login = async (credentials: Credentials): Promise<User> => {
  const { token, user } = await apiClient.post('/auth/login', credentials, authResponseSchema)
  authToken.set(token)
  return user
}

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout', undefined, z.undefined())
  } finally {
    authToken.clear()
  }
}

/**
 * Resolves the signed-in user, or `null` when there is no valid session.
 * An expired or revoked token is cleared so the next request starts clean.
 */
export const getCurrentUser = async (): Promise<User | null> => {
  if (!authToken.get()) {
    return null
  }

  try {
    return await apiClient.get('/auth/me', userSchema)
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      authToken.clear()
      return null
    }

    throw error
  }
}
