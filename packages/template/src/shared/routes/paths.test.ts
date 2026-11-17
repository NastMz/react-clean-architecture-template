import { describe, expect, it } from 'vitest'

import { getSafeRedirect, paths } from './paths'

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

describe('paths', () => {
  it('encodes ids in todo detail paths', () => {
    expect(paths.todoDetails('a b/c')).toBe('/todos/a%20b%2Fc')
  })
})
