/**
 * In-memory data store for the mock backend. It stands in for a real API so the
 * app runs without a server; keep it for tests once you have a real backend.
 */

export interface MockUser {
  id: string
  email: string
  name: string
  password: string
}

const users: readonly MockUser[] = [
  { id: 'user-1', email: 'demo@example.com', name: 'Demo User', password: 'demo123' },
]

export const db = {
  users: {
    findByCredentials: (email: string, password: string) =>
      users.find((user) => user.email === email && user.password === password),
    findById: (id: string) => users.find((user) => user.id === id),
  },
  /** Restores seed data. Tests call this after each case; reset your own collections here. */
  reset: () => {
    // Nothing to reset yet.
  },
}

/** Deterministic token so a browser reload keeps the demo session alive. */
export const tokenForUser = (userId: string) => `mock-token.${userId}`

export const userIdFromToken = (token: string) =>
  token.startsWith('mock-token.') ? token.slice('mock-token.'.length) : undefined
