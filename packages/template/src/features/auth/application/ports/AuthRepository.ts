import type { AppError } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'

import type { Credentials, Session } from '../../domain/User'

/**
 * Auth Repository Port (Interface)
 * Defines the contract for auth persistence operations
 * Implementation details (in-memory, API, database) are hidden behind this interface
 */
export interface AuthRepository {
  /**
   * Authenticates user with provided credentials
   * @param credentials - User's email and password
   * @returns Result containing Session on success or AppError on failure
   */
  login(credentials: Credentials): Promise<Result<Session, AppError>>

  /**
   * Logs out the current user and clears session
   * @returns Result containing void on success or AppError on failure
   */
  logout(): Promise<Result<void, AppError>>

  /**
   * Retrieves the current authenticated session
   * @returns Result containing Session or null if no active session
   */
  currentSession(): Promise<Result<Session | null, AppError>>
}
