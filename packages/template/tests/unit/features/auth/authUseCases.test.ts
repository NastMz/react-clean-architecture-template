import { createAuthUseCases } from '@features/auth/application/authUseCases'
import type { AuthRepository } from '@features/auth/application/ports/AuthRepository'
import type { Credentials, Session } from '@features/auth/domain/User'
import type { LoggerPort, TelemetryPort } from '@shared/contracts/TelemetryPort'
import { AppErrorFactory } from '@shared/kernel/AppError'
import { Result } from '@shared/kernel/Result'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('createAuthUseCases', () => {
  const credentials: Credentials = {
    email: 'demo@example.com',
    password: 'demo123',
  }

  const session: Session = {
    user: {
      id: 'user-1',
      email: 'demo@example.com',
      name: 'Demo User',
    },
    token: 'demo-token',
  }

  const telemetry: TelemetryPort & LoggerPort = {
    track: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }

  const repository: AuthRepository = {
    login: vi.fn(),
    logout: vi.fn(),
    currentSession: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('tracks login attempt and success while returning the repository session', async () => {
    vi.mocked(repository.login).mockResolvedValue(Result.ok(session))
    const useCases = createAuthUseCases(repository, telemetry)

    const result = await useCases.login(credentials)

    expect(repository.login).toHaveBeenCalledWith(credentials)
    expect(result.isOk).toBe(true)
    expect(result.value).toEqual(session)
    expect(telemetry.track).toHaveBeenNthCalledWith(1, 'auth.login.attempt', {
      email: credentials.email,
    })
    expect(telemetry.track).toHaveBeenNthCalledWith(2, 'auth.login.success', {
      userId: session.user.id,
    })
  })

  it('tracks login errors with the error kind and returns the same failure', async () => {
    const error = AppErrorFactory.validation('Invalid credentials')
    vi.mocked(repository.login).mockResolvedValue(Result.err(error))
    const useCases = createAuthUseCases(repository, telemetry)

    const result = await useCases.login(credentials)

    expect(result.isErr).toBe(true)
    expect(result.error).toEqual(error)
    expect(telemetry.track).toHaveBeenNthCalledWith(1, 'auth.login.attempt', {
      email: credentials.email,
    })
    expect(telemetry.track).toHaveBeenNthCalledWith(2, 'auth.login.error', {
      kind: error.kind,
    })
  })

  it('tracks logout success and logout errors', async () => {
    vi.mocked(repository.logout)
      .mockResolvedValueOnce(Result.ok(undefined))
      .mockResolvedValueOnce(Result.err(AppErrorFactory.network('Offline')))
    const useCases = createAuthUseCases(repository, telemetry)

    const success = await useCases.logout()
    const failure = await useCases.logout()

    expect(success.isOk).toBe(true)
    expect(failure.isErr).toBe(true)
    expect(telemetry.track).toHaveBeenNthCalledWith(1, 'auth.logout.success')
    expect(telemetry.track).toHaveBeenNthCalledWith(2, 'auth.logout.error', {
      kind: 'Network',
    })
  })

  it('normalizes missing current sessions to null', async () => {
    vi.mocked(repository.currentSession).mockResolvedValue(Result.ok(null))
    const useCases = createAuthUseCases(repository, telemetry)

    const result = await useCases.currentSession()

    expect(result.isOk).toBe(true)
    expect(result.value).toBeNull()
  })

  it('maps unexpected current session errors to unknown app errors', async () => {
    const cause = new Error('storage exploded')
    const unknownFailure = Result.err<Session | null, unknown>(cause) as Awaited<
      ReturnType<AuthRepository['currentSession']>
    >
    vi.mocked(repository.currentSession).mockResolvedValue(unknownFailure)
    const useCases = createAuthUseCases(repository, telemetry)

    const result = await useCases.currentSession()

    expect(result.isErr).toBe(true)
    expect(result.error.kind).toBe('Unknown')
    expect(result.error.message).toBe('storage exploded')
    expect(result.error.cause).toBe(cause)
  })
})
