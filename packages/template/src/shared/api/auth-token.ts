const STORAGE_KEY = 'app.auth-token'

/**
 * Bearer token persistence. Kept in Shared because the API client attaches it
 * to every request; the session entity decides when to set or clear it.
 *
 * localStorage keeps the demo simple. Prefer httpOnly cookies when your backend
 * supports them.
 */
export const authToken = {
  get: (): string | null => localStorage.getItem(STORAGE_KEY),
  set: (token: string): void => {
    localStorage.setItem(STORAGE_KEY, token)
  },
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEY)
  },
}
