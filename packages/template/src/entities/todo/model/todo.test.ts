import { describe, expect, it } from 'vitest'

import { TODO_TITLE_MAX_LENGTH, todoTitleSchema } from './todo'

describe('todoTitleSchema', () => {
  it('trims surrounding whitespace', () => {
    expect(todoTitleSchema.parse('  Buy milk  ')).toBe('Buy milk')
  })

  it('rejects blank titles', () => {
    expect(todoTitleSchema.safeParse('   ').error?.issues[0]?.message).toBe('Title is required')
  })

  it('rejects titles over the maximum length', () => {
    const result = todoTitleSchema.safeParse('x'.repeat(TODO_TITLE_MAX_LENGTH + 1))

    expect(result.error?.issues[0]?.message).toBe('Title must be 120 characters or fewer')
  })

  it('accepts a title at the maximum length', () => {
    expect(todoTitleSchema.safeParse('x'.repeat(TODO_TITLE_MAX_LENGTH)).success).toBe(true)
  })
})
