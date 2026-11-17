import { describe, expect, it } from 'vitest'

import { paths } from './paths'

describe('paths', () => {
  it('encodes ids in todo detail paths', () => {
    expect(paths.todoDetails('a b/c')).toBe('/todos/a%20b%2Fc')
  })
})
