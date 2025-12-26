import { describe, it, expect, beforeEach, vi } from 'vitest'

import { CircuitBreaker, CircuitBreakerError } from '@shared/infra/resilience/CircuitBreaker'

describe('CircuitBreaker', () => {
  let mockFn: ReturnType<typeof vi.fn>
  let breaker: CircuitBreaker<string>

  beforeEach(() => {
    mockFn = vi.fn()
    breaker = new CircuitBreaker(mockFn, {
      failureThreshold: 3,
      resetTimeout: 100,
    })
  })

  it('executes function successfully when healthy', async () => {
    mockFn.mockResolvedValue('success')

    const result = await breaker.execute()

    expect(result).toBe('success')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(breaker.getState()).toBe('CLOSED')
  })

  it('opens circuit after threshold failures', async () => {
    mockFn.mockRejectedValue(new Error('fail'))

    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute()
      } catch {
        // Expected
      }
    }

    expect(breaker.getState()).toBe('OPEN')

    // Next call should throw immediately
    await expect(breaker.execute()).rejects.toThrow(CircuitBreakerError)
  })

  it('transitions to HALF_OPEN after reset timeout', async () => {
    mockFn.mockRejectedValue(new Error('fail'))

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute()
      } catch {
        // Expected
      }
    }

    expect(breaker.getState()).toBe('OPEN')

    // Wait for reset timeout
    await new Promise((resolve) => setTimeout(resolve, 150))

    // Should be HALF_OPEN now
    expect(breaker.getState()).toBe('HALF_OPEN')
  })

  it('resets to CLOSED on successful recovery', async () => {
    mockFn.mockRejectedValue(new Error('fail'))

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute()
      } catch {
        // Expected
      }
    }

    // Wait for reset timeout
    await new Promise((resolve) => setTimeout(resolve, 150))

    // Now make it succeed
    mockFn.mockResolvedValue('success')
    const result = await breaker.execute()

    expect(result).toBe('success')
    expect(breaker.getState()).toBe('CLOSED')
  })
})
