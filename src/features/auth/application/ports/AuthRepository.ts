import type { AppError } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'

import type { Credentials, Session } from '../../domain/User'

export interface AuthRepository {
  login(credentials: Credentials): Promise<Result<Session, AppError>>
  logout(): Promise<Result<void, AppError>>
  currentSession(): Promise<Result<Session | null, AppError>>
}
