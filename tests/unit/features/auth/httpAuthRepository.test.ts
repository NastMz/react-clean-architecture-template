import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpAuthRepository } from '@features/auth/infra/httpAuthRepository'
import type { TelemetryPort } from '@shared/application/ports/TelemetryPort'
import type { HttpClient } from '@shared/infra/http/HttpClient'
import { Result } from '@shared/domain/result/Result'
import type { Session } from '@features/auth/domain/User'

describe('HttpAuthRepository', () => {
  const mockTelemetry: TelemetryPort = {
    track: vi.fn(),
  }

  const mockSession: Session = {
    user: {
      id: 'user-1',
      email: 'demo@example.com',
      name: 'Demo User',
    },
    token: 'mock-token-123',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockHttpClient: HttpClient = {
        request: vi.fn().mockResolvedValue(
          Result.ok({
            status: 200,
            data: mockSession,
          }),
        ),
      }

      const repository = new HttpAuthRepository(mockHttpClient, mockTelemetry, {
        baseUrl: 'https://api.example.com',
      })

      const result = await repository.login({
        email: 'demo@example.com',
        password: 'password123',
      })

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value).toEqual(mockSession)
      }
      expect(mockTelemetry.track).toHaveBeenCalledWith('auth.login.attempt', {
        email: 'demo@example.com',
      })
      expect(mockTelemetry.track).toHaveBeenCalledWith('auth.login.success', {
        userId: 'user-1',
      })
    })

    it('should handle login errors from HTTP client', async () => {
      const mockHttpClient: HttpClient = {
        request: vi.fn().mockResolvedValue(
          Result.err({
            kind: 'Validation',
            message: 'Invalid credentials',
          }),
        ),
      }

      const repository = new HttpAuthRepository(mockHttpClient, mockTelemetry, {
        baseUrl: 'https://api.example.com',
      })

      const result = await repository.login({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      })

      expect(result.isErr).toBe(true)
      if (result.isErr) {
        expect(result.error.kind).toBe('Validation')
        expect(result.error.message).toBe('Invalid credentials')
      }
      expect(mockTelemetry.track).toHaveBeenCalledWith('auth.login.error', {
        kind: 'Validation',
      })
    })

    it('should handle unexpected errors during login', async () => {
      const mockHttpClient: HttpClient = {
        request: vi.fn().mockRejectedValue(new Error('Network timeout')),
      }

      const repository = new HttpAuthRepository(mockHttpClient, mockTelemetry, {
        baseUrl: 'https://api.example.com',
      })

      const result = await repository.login({
        email: 'demo@example.com',
        password: 'password123',
      })

      expect(result.isErr).toBe(true)
      if (result.isErr) {
        expect(result.error.kind).toBe('Unknown')
      }
    })
  })

  describe('currentSession', () => {
    it('should return cached session when available', async () => {
      const mockHttpClient: HttpClient = {
        request: vi.fn().mockResolvedValue(
          Result.ok({
            status: 200,
            data: mockSession,
          }),
        ),
      }

      const repository = new HttpAuthRepository(mockHttpClient, mockTelemetry, {
        baseUrl: 'https://api.example.com',
      })

      // First login to cache session
      await repository.login({
        email: 'demo@example.com',
        password: 'password123',
      })

      // Reset mock to verify no additional HTTP calls
      vi.clearAllMocks()

      const result = await repository.currentSession()

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value).toEqual(mockSession)
      }
      // Should not make HTTP call since session is cached
      expect(mockHttpClient.request).not.toHaveBeenCalled()
    })

    it('should fetch session from server when not cached', async () => {
      const mockHttpClient: HttpClient = {
        request: vi.fn().mockResolvedValue(
          Result.ok({
            status: 200,
            data: mockSession,
          }),
        ),
      }

      const repository = new HttpAuthRepository(mockHttpClient, mockTelemetry, {
        baseUrl: 'https://api.example.com',
      })

      const result = await repository.currentSession()

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value).toEqual(mockSession)
      }
      expect(mockHttpClient.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.example.com/auth/session',
      })
    })
  })

  describe('logout', () => {
    it('should logout successfully and clear session cache', async () => {
      const mockHttpClient: HttpClient = {
        request: vi.fn().mockResolvedValue(
          Result.ok({
            status: 200,
            data: undefined,
          }),
        ),
      }

      const repository = new HttpAuthRepository(mockHttpClient, mockTelemetry, {
        baseUrl: 'https://api.example.com',
      })

      // Login first to have a cached session
      mockHttpClient.request = vi.fn().mockResolvedValue(
        Result.ok({
          status: 200,
          data: mockSession,
        }),
      )

      await repository.login({
        email: 'demo@example.com',
        password: 'password123',
      })

      // Now logout
      mockHttpClient.request = vi.fn().mockResolvedValue(
        Result.ok({
          status: 200,
          data: undefined,
        }),
      )

      const result = await repository.logout()

      expect(result.isOk).toBe(true)
      expect(mockTelemetry.track).toHaveBeenCalledWith('auth.logout.success')

      // Verify session cache is cleared - next currentSession should make HTTP call
      vi.clearAllMocks()
      await repository.currentSession()
      expect(mockHttpClient.request).toHaveBeenCalled()
    })
  })
})
