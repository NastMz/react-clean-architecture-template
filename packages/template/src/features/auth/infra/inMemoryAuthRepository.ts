import type { AuthRepository } from '@features/auth/application/ports/AuthRepository'
import type { Credentials, Session, User } from '@features/auth/domain/User'
import type { LoggerPort, TelemetryPort } from '@shared/application/ports/TelemetryPort'
import { AppErrorFactory } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'
import { z } from 'zod'

/**
 * Zod schema for validating login credentials format
 */
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

/**
 * Demo user for testing authentication flow
 * In a real app, users would be stored in a database
 */
const demoUser: User & { password: string } = {
  id: 'user-1',
  email: 'demo@example.com',
  name: 'Demo User',
  password: 'demo123',
}

/**
 * In-memory implementation of AuthRepository
 * Simulates user authentication without external service
 * Used for development and testing
 * @param telemetry - Telemetry service for logging authentication events
 * @returns Implementation of AuthRepository interface
 */
export const createInMemoryAuthRepository = (
  telemetry: TelemetryPort & LoggerPort,
): AuthRepository => {
  const STORAGE_KEY = 'demo_session'

  // Load initial session from localStorage if available
  const loadSession = (): Session | null => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as Session) : null
    } catch {
      return null
    }
  }

  const saveSession = (session: Session | null): void => {
    if (typeof window === 'undefined') return
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  let session: Session | null = loadSession()

  return {
    async login(credentials: Credentials) {
      const parsed = credentialsSchema.safeParse(credentials)
      if (!parsed.success) {
        return Promise.resolve(Result.err(AppErrorFactory.validation('Credenciales inválidas')))
      }

      if (parsed.data.email !== demoUser.email || parsed.data.password !== demoUser.password) {
        telemetry.warn('Login rechazado', { email: parsed.data.email })
        return Promise.resolve(
          Result.err(AppErrorFactory.unauthorized('Email o contraseña incorrectos')),
        )
      }

      session = {
        user: { id: demoUser.id, email: demoUser.email, name: demoUser.name },
        token: 'demo-token',
      }
      saveSession(session)
      return Promise.resolve(Result.ok(session))
    },
    async logout() {
      session = null
      saveSession(null)
      return Promise.resolve(Result.ok(undefined))
    },
    async currentSession() {
      return Promise.resolve(Result.ok(session))
    },
  }
}
