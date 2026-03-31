/**
 * Retry Policy Pattern
 * Automatically retries failed operations with exponential backoff
 *
 * @example
 * ```ts
 * const policy = new RetryPolicy(3, { baseDelay: 100 })
 * await policy.execute(async () => fetch(url))
 * ```
 */
export interface RetryPolicyOptions {
  /** Base delay in ms (default: 100) */
  baseDelay?: number
  /** Max delay in ms (default: 10000) */
  maxDelay?: number
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number
  /** Retry only on these error codes (default: network + 5xx) */
  retryableStatusCodes?: number[]
}

export class RetryPolicy {
  private readonly maxAttempts: number
  private readonly baseDelay: number
  private readonly maxDelay: number
  private readonly backoffMultiplier: number
  private readonly retryableStatusCodes: Set<number>

  constructor(maxAttempts: number, options?: RetryPolicyOptions) {
    this.maxAttempts = maxAttempts
    this.baseDelay = options?.baseDelay ?? 100
    this.maxDelay = options?.maxDelay ?? 10000
    this.backoffMultiplier = options?.backoffMultiplier ?? 2
    this.retryableStatusCodes = new Set(
      options?.retryableStatusCodes ?? [
        408, // Request Timeout
        429, // Too Many Requests
        500, // Internal Server Error
        502, // Bad Gateway
        503, // Service Unavailable
        504, // Gateway Timeout
      ],
    )
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown = new Error('Unknown error')

    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error

        // Check if error is retryable
        if (!this.isRetryable(error)) {
          throw error
        }

        // Don't wait after last attempt
        if (attempt < this.maxAttempts - 1) {
          const delay = this.calculateDelay(attempt)
          await this.sleep(delay)
        }
      }
    }

    throw lastError
  }

  private isRetryable(error: unknown): boolean {
    if (error instanceof TypeError) {
      // Network errors are retryable (fetch throws TypeError on network failure)
      return true
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      typeof (error as Record<string, unknown>).statusCode === 'number'
    ) {
      return this.retryableStatusCodes.has((error as Record<string, unknown>).statusCode as number)
    }

    return false
  }

  private calculateDelay(attemptNumber: number): number {
    const exponentialDelay = this.baseDelay * Math.pow(this.backoffMultiplier, attemptNumber)
    return Math.min(exponentialDelay, this.maxDelay)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
