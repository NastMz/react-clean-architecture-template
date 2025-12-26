/**
 * Circuit Breaker Pattern
 * Prevents cascading failures by stopping requests to a failing service
 * States: CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing recovery)
 *
 * @example
 * ```ts
 * const breaker = new CircuitBreaker(async () => fetch(url), {
 *   failureThreshold: 5,     // open after 5 failures
 *   resetTimeout: 30000,     // try again after 30s
 * })
 * await breaker.execute()
 * ```
 */
export interface CircuitBreakerOptions {
  /** Number of failures before opening circuit (default: 5) */
  failureThreshold?: number
  /** Time in ms before attempting recovery (default: 30000 = 30s) */
  resetTimeout?: number
}

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export class CircuitBreakerError extends Error {
  constructor(state: CircuitBreakerState) {
    super(`Circuit breaker is ${state}. Service is temporarily unavailable.`)
    this.name = 'CircuitBreakerError'
  }
}

export class CircuitBreaker<T> {
  private state: CircuitBreakerState = 'CLOSED'
  private failureCount = 0
  private lastFailureTime?: number
  private readonly failureThreshold: number
  private readonly resetTimeout: number

  constructor(
    private readonly fn: () => Promise<T>,
    options?: CircuitBreakerOptions,
  ) {
    this.failureThreshold = options?.failureThreshold ?? 5
    this.resetTimeout = options?.resetTimeout ?? 30000
  }

  getState(): CircuitBreakerState {
    if (this.state === 'OPEN') {
      const now = Date.now()
      const timeSinceLastFailure = now - (this.lastFailureTime ?? 0)
      if (timeSinceLastFailure > this.resetTimeout) {
        this.state = 'HALF_OPEN'
        return 'HALF_OPEN'
      }
    }
    return this.state
  }

  async execute(): Promise<T> {
    const state = this.getState()

    if (state === 'OPEN') {
      throw new CircuitBreakerError('OPEN')
    }

    try {
      const result = await this.fn()

      if (state === 'HALF_OPEN') {
        this.reset()
      }

      return result
    } catch (error) {
      this.failureCount++
      this.lastFailureTime = Date.now()

      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN'
      }

      throw error
    }
  }

  private reset(): void {
    this.state = 'CLOSED'
    this.failureCount = 0
    this.lastFailureTime = undefined
  }
}
