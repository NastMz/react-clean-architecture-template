/**
 * Represents an authenticated user in the system
 */
export interface User {
  id: string
  email: string
  name: string
}

/**
 * Represents an active user session with authentication token
 */
export interface Session {
  user: User
  token: string
}

/**
 * Login credentials provided by the user
 */
export interface Credentials {
  email: string
  password: string
}
