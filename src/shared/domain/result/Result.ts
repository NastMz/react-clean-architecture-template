import type { AppError } from '../errors/AppError'
import { AppErrorFactory } from '../errors/AppError'

export class Result<T, E = AppError> {
  private readonly state: { ok: true; value: T } | { ok: false; error: E }
  private constructor(state: { ok: true; value: T } | { ok: false; error: E }) {
    this.state = state
  }

  static ok<T, E = AppError>(value: T): Result<T, E> {
    return new Result<T, E>({ ok: true, value })
  }

  static err<T = never, E = AppError>(error: E): Result<T, E> {
    return new Result<T, E>({ ok: false, error })
  }

  get isOk(): boolean {
    return this.state.ok
  }

  get isErr(): boolean {
    return !this.state.ok
  }

  get value(): T {
    if (!this.state.ok) {
      throw new Error('Tried to read value from Err result')
    }
    return this.state.value
  }

  get error(): E {
    if (this.state.ok) {
      throw new Error('Tried to read error from Ok result')
    }
    return this.state.error
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.state.ok) {
      return Result.ok(fn(this.state.value))
    }
    return Result.err(this.state.error)
  }

  mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this.state.ok) {
      return Result.ok(this.state.value)
    }
    return Result.err(fn(this.state.error))
  }

  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return this.state.ok ? handlers.ok(this.state.value) : handlers.err(this.state.error)
  }

  unwrapOrThrow(): T {
    if (this.state.ok) {
      return this.state.value
    }
    const appError = (this.state.error ?? {}) as AppError
    const error = AppErrorFactory.fromUnknown(appError)
    throw new Error(`${error.kind}: ${error.message}`)
  }
}
