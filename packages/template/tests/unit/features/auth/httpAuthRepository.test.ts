import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpAuthRepository } from '@features/auth/infra/httpAuthRepository'
import type { TelemetryPort } from '@shared/contracts/TelemetryPort'
import type { HttpClient } from '@shared/network/HttpClient'
import { Result } from '@shared/kernel/Result'
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
    vi.useRealTimers()
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
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://api.example.com/auth/login',
          responseSchema: expect.any(Object),
        }),
      )
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
      expect(mockHttpClient.request).toHaveBeenCalledTimes(1)
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

    it('should retry transient network failures before succeeding', async () => {
      const mockHttpClient: HttpClient = {
        request: vi
          .fn()
          .mockResolvedValueOnce(
            Result.err({
              kind: 'Network',
              message: 'Network error',
            }),
          )
          .mockResolvedValueOnce(
            Result.err({
              kind: 'Network',
              message: 'Network error',
            }),
          )
          .mockResolvedValue(
            Result.ok({
              status: 200,
              data: mockSession,
            }),
          ),
      }

      const repository = new HttpAuthRepository(mockHttpClient, mockTelemetry, {
        baseUrl: 'https://api.example.com',
        retry: { maxAttempts: 3, baseDelay: 0, maxDelay: 0 },
      })

      const result = await repository.login({
        email: 'demo@example.com',
        password: 'password123',
      })

      expect(result.isOk).toBe(true)
      expect(mockHttpClient.request).toHaveBeenCalledTimes(3)
    })

    it('should return the last retryable error after exhausting retries', async () => {
      const mockHttpClient: HttpClient = {
        request: vi.fn().mockResolvedValue(
          Result.err({
            kind: 'Network',
            message: 'Network error',
          }),
        ),
      }

      const repository = new HttpAuthRepository(mockHttpClient, mockTelemetry, {
        baseUrl: 'https://api.example.com',
        retry: { maxAttempts: 2, baseDelay: 0, maxDelay: 0 },
      })

      const result = await repository.login({
        email: 'demo@example.com',
        password: 'password123',
      })

      expect(result.isErr).toBe(true)
      if (result.isErr) {
        expect(result.error.kind).toBe('Network')
      }
      expect(mockHttpClient.request).toHaveBeenCalledTimes(2)
    })

    it('should open the auth circuit after repeated transient failures', async () => {
      const mockHttpClient: HttpClient = {
        request: vi.fn().mockResolvedValue(
          Result.err({
            kind: 'Network',
            message: 'Network error',
          }),
        ),
      }

      const repository = new HttpAuthRepository(mockHttpClient, mockTelemetry, {
        baseUrl: 'https://api.example.com',
        retry: { maxAttempts: 1, baseDelay: 0, maxDelay: 0 },
        circuitBreaker: { failureThreshold: 2, resetTimeout: 1000 },
      })

      await repository.login({
        email: 'demo@example.com',
        password: 'password123',
      })
      await repository.login({
        email: 'demo@example.com',
        password: 'password123',
      })

      const result = await repository.login({
        email: 'demo@example.com',
        password: 'password123',
      })

      expect(result.isErr).toBe(true)
      if (result.isErr) {
        expect(result.error.kind).toBe('ServiceUnavailable')
        expect(result.error.message).toBe('Authentication service temporarily unavailable')
      }
      expect(mockHttpClient.request).toHaveBeenCalledTimes(2)
    })

    it('should allow recovery after the auth circuit reset timeout', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-04-01T00:00:00.000Z'))

      const mockHttpClient: HttpClient = {
        request: vi
          .fn()
          .mockResolvedValueOnce(
            Result.err({
              kind: 'Network',
              message: 'Network error',
            }),
          )
          .mockResolvedValueOnce(
            Result.ok({
              status: 200,
              data: mockSession,
            }),
          ),
      }

      const repository = new HttpAuthRepository(mockHttpClient, mockTelemetry, {
        baseUrl: 'https://api.example.com',
        retry: { maxAttempts: 1, baseDelay: 0, maxDelay: 0 },
        circuitBreaker: { failureThreshold: 1, resetTimeout: 1000 },
      })

      await repository.login({
        email: 'demo@example.com',
        password: 'password123',
      })

      const blockedAttempt = await repository.login({
        email: 'demo@example.com',
        password: 'password123',
      })

      expect(blockedAttempt.isErr).toBe(true)
      expect(mockHttpClient.request).toHaveBeenCalledTimes(1)

      vi.setSystemTime(new Date('2026-04-01T00:00:01.001Z'))

      const recoveredAttempt = await repository.login({
        email: 'demo@example.com',
        password: 'password123',
      })

      expect(recoveredAttempt.isOk).toBe(true)
      expect(mockHttpClient.request).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
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
        responseSchema: expect.any(Object),
      })
    })

    it('should retry retryable server errors before succeeding', async () => {
      const mockHttpClient: HttpClient = {
        request: vi
          .fn()
          .mockResolvedValueOnce(
            Result.err({
              kind: 'Unknown',
              message: 'Request failed with status 503',
              cause: { statusCode: 503 },
            }),
          )
          .mockResolvedValue(
            Result.ok({
              status: 200,
              data: mockSession,
            }),
          ),
      }

      const repository = new HttpAuthRepository(mockHttpClient, mockTelemetry, {
        baseUrl: 'https://api.example.com',
        retry: { maxAttempts: 2, baseDelay: 0, maxDelay: 0 },
      })

      const result = await repository.currentSession()

      expect(result.isOk).toBe(true)
      expect(mockHttpClient.request).toHaveBeenCalledTimes(2)
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
