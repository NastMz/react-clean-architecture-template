import type { AppError } from '../errors/AppError'
import { AppErrorFactory } from '../errors/AppError'

/**
 * Result<T, E> - Monad for Railway-oriented Programming
 * Represents either a success (T) or failure (E)
 * Eliminates null checks and exception handling in favor of explicit error handling
 *
 * @template T - The success value type
 * @template E - The error type (defaults to AppError)
 */
export class Result<T, E = AppError> {
  private readonly state: { ok: true; value: T } | { ok: false; error: E }

  /**
   * Private constructor - use static factory methods ok() or err()
   */
  private constructor(state: { ok: true; value: T } | { ok: false; error: E }) {
    this.state = state
  }

  /**
   * Creates a successful Result
   * @param value - The success value
   * @returns Result containing the success value
   */
  static ok<T, E = AppError>(value: T): Result<T, E> {
    return new Result<T, E>({ ok: true, value })
  }

  /**
   * Creates a failed Result
   * @param error - The error value
   * @returns Result containing the error
   */
  static err<T = never, E = AppError>(error: E): Result<T, E> {
    return new Result<T, E>({ ok: false, error })
  }

  /**
   * Checks if Result is success
   */
  get isOk(): boolean {
    return this.state.ok
  }

  /**
   * Checks if Result is failure
   */
  get isErr(): boolean {
    return !this.state.ok
  }

  /**
   * Gets the success value
   * @throws {Error} If Result is an error
   */
  get value(): T {
    if (!this.state.ok) {
      throw new Error('Tried to read value from Err result')
    }
    return this.state.value
  }

  /**
   * Gets the error value
   * @throws {Error} If Result is success
   */
  get error(): E {
    if (this.state.ok) {
      throw new Error('Tried to read error from Ok result')
    }
    return this.state.error
  }

  /**
   * Transforms the success value
   * If Result is error, passes it through unchanged
   * @param fn - Transformation function for success value
   * @returns New Result with transformed value or same error
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.state.ok) {
      return Result.ok(fn(this.state.value))
    }
    return Result.err(this.state.error)
  }

  /**
   * Transforms the error value
   * If Result is success, passes it through unchanged
   * @param fn - Transformation function for error
   * @returns New Result with same value or transformed error
   */
  mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this.state.ok) {
      return Result.ok(this.state.value)
    }
    return Result.err(fn(this.state.error))
  }

  /**
   * Pattern matches on success and error cases
   * Executes appropriate handler and returns result
   * @param handlers - Object with ok and err handler functions
   * @returns Result of executing the appropriate handler
   */
  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return this.state.ok ? handlers.ok(this.state.value) : handlers.err(this.state.error)
  }

  /**
   * Extracts success value or throws error as exception
   * Useful when you need to bridge to exception-based code
   * @throws {Error} If Result is an error
   * @returns The success value
   */
  unwrapOrThrow(): T {
    if (this.state.ok) {
      return this.state.value
    }
    const appError = (this.state.error ?? {}) as AppError
    const error = AppErrorFactory.fromUnknown(appError)
    throw new Error(`${error.kind}: ${error.message}`)
  }
}
