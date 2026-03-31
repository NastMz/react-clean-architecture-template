import { createInMemoryAuthRepository } from '@features/auth/infra/inMemoryAuthRepository'
import { ConsoleTelemetry } from '@shared/infra/telemetry/ConsoleTelemetry'
import { describe, expect, it } from 'vitest'

describe('InMemoryAuthRepository', () => {
  it('should login with valid credentials', async () => {
    const telemetry = new ConsoleTelemetry()
    const repo = createInMemoryAuthRepository(telemetry)

    const result = await repo.login({ email: 'demo@example.com', password: 'demo123' })

    expect(result.isOk).toBe(true)
    expect(result.value.user.email).toBe('demo@example.com')
    expect(result.value.token).toBe('demo-token')
  })

  it('should reject invalid credentials', async () => {
    const telemetry = new ConsoleTelemetry()
    const repo = createInMemoryAuthRepository(telemetry)

    const result = await repo.login({ email: 'wrong@example.com', password: 'wrong' })

    expect(result.isErr).toBe(true)
    expect(result.error.kind).toBe('Validation')
  })

  it('should logout and clear session', async () => {
    const telemetry = new ConsoleTelemetry()
    const repo = createInMemoryAuthRepository(telemetry)

    await repo.login({ email: 'demo@example.com', password: 'demo123' })
    await repo.logout()

    const sessionResult = await repo.currentSession()
    expect(sessionResult.value).toBeNull()
  })
})
