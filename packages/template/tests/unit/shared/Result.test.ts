import { AppErrorFactory } from '@shared/domain/errors/AppError'
import { Result } from '@shared/domain/result/Result'
import { describe, expect, it } from 'vitest'

describe('Result', () => {
  it('should create Ok result', () => {
    const result = Result.ok(42)
    expect(result.isOk).toBe(true)
    expect(result.isErr).toBe(false)
    expect(result.value).toBe(42)
  })

  it('should create Err result', () => {
    const error = AppErrorFactory.validation('Invalid')
    const result = Result.err(error)
    expect(result.isOk).toBe(false)
    expect(result.isErr).toBe(true)
    expect(result.error).toEqual(error)
  })

  it('should map Ok values', () => {
    const result = Result.ok(5).map((n) => n * 2)
    expect(result.value).toBe(10)
  })

  it('should not map Err values', () => {
    const error = AppErrorFactory.unknown('Fail')
    const result = Result.err<number>(error).map((n) => n * 2)
    expect(result.isErr).toBe(true)
    expect(result.error).toEqual(error)
  })

  it('should match on Ok and Err', () => {
    const okResult = Result.ok(10)
    const errResult = Result.err(AppErrorFactory.network('Offline'))

    const okValue = okResult.match({ ok: (v) => v * 2, err: () => 0 })
    const errValue = errResult.match({ ok: (v) => v * 2, err: () => 0 })

    expect(okValue).toBe(20)
    expect(errValue).toBe(0)
  })
})
