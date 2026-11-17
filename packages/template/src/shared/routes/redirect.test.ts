import { describe, expect, it } from 'vitest'

import { getSafeRedirect } from './redirect'

describe('getSafeRedirect', () => {
  it.each(['/todos', '/todos/1?tab=details'])('accepts the internal path %s', (target) => {
    expect(getSafeRedirect(target, '/fallback')).toBe(target)
  })

  it.each([
    null,
    undefined,
    '',
    'todos',
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
  ])('falls back for %s', (target) => {
    expect(getSafeRedirect(target, '/fallback')).toBe('/fallback')
  })
})
