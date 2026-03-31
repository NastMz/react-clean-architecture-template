import { createInMemoryAuthRepository } from '@features/auth/infra/inMemoryAuthRepository'
import type { LoggerPort, TelemetryPort } from '@shared/contracts/TelemetryPort'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('InMemoryAuthRepository', () => {
  const telemetry: TelemetryPort & LoggerPort = {
    track: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should login with valid credentials', async () => {
    const repo = createInMemoryAuthRepository(telemetry)

    const result = await repo.login({ email: 'demo@example.com', password: 'demo123' })

    expect(result.isOk).toBe(true)
    expect(result.value.user.email).toBe('demo@example.com')
    expect(result.value.token).toBe('demo-token')
  })

  it('should reject invalid credentials', async () => {
    const repo = createInMemoryAuthRepository(telemetry)

    const result = await repo.login({ email: 'wrong@example.com', password: 'wrong' })

    expect(result.isErr).toBe(true)
    expect(result.error.kind).toBe('Validation')
  })

  it('should logout and clear session', async () => {
    const repo = createInMemoryAuthRepository(telemetry)

    await repo.login({ email: 'demo@example.com', password: 'demo123' })
    await repo.logout()

    const sessionResult = await repo.currentSession()
    expect(sessionResult.value).toBeNull()
  })

  it('should clear corrupted stored session during hydration', async () => {
    localStorage.setItem('demo_session', '{bad json')

    const repo = createInMemoryAuthRepository(telemetry)
    const sessionResult = await repo.currentSession()

    expect(sessionResult.isOk).toBe(true)
    expect(sessionResult.value).toBeNull()
    expect(localStorage.getItem('demo_session')).toBeNull()
    expect(telemetry.warn).toHaveBeenCalledWith('Sesion persistida corrupta; storage limpiado')
  })

  it('should clear invalid stored session shape during hydration', async () => {
    localStorage.setItem(
      'demo_session',
      JSON.stringify({
        user: { id: 'user-1', email: 'not-an-email', name: 'Demo User' },
        token: '',
      }),
    )

    const repo = createInMemoryAuthRepository(telemetry)
    const sessionResult = await repo.currentSession()

    expect(sessionResult.isOk).toBe(true)
    expect(sessionResult.value).toBeNull()
    expect(localStorage.getItem('demo_session')).toBeNull()
    expect(telemetry.warn).toHaveBeenCalledWith(
      'Sesion persistida invalida; storage limpiado',
      expect.objectContaining({
        issues: expect.any(Array),
      }),
    )
  })
})
