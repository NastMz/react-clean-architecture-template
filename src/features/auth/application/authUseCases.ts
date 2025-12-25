import type { LoggerPort, TelemetryPort } from '@shared/application/ports/TelemetryPort'
import type { AppError } from '@shared/domain/errors/AppError'
import { AppErrorFactory } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'

import type { Credentials, Session } from '../domain/User'
import type { AuthRepository } from './ports/AuthRepository'

export interface AuthUseCases {
  login(credentials: Credentials): Promise<Result<Session, AppError>>
  logout(): Promise<Result<void, AppError>>
  currentSession(): Promise<Result<Session | null, AppError>>
}

export const createAuthUseCases = (
  repository: AuthRepository,
  telemetry: TelemetryPort & LoggerPort,
): AuthUseCases => ({
  async login(credentials) {
    telemetry.track('auth.login.attempt', { email: credentials.email })
    const result = await repository.login(credentials)
    result.match({
      ok: (session) => telemetry.track('auth.login.success', { userId: session.user.id }),
      err: (error) => telemetry.track('auth.login.error', { kind: error.kind }),
    })
    return result
  },
  async logout() {
    const result = await repository.logout()
    result.match({
      ok: () => telemetry.track('auth.logout.success'),
      err: (error) => telemetry.track('auth.logout.error', { kind: error.kind }),
    })
    return result
  },
  async currentSession() {
    const result = await repository.currentSession()
    return result
      .map((session) => session ?? null)
      .mapError((error) => AppErrorFactory.fromUnknown(error))
  },
})
