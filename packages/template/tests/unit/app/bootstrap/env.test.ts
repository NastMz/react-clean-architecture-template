import { createAppConfig } from '@app/bootstrap/config'
import { parseEnv } from '@app/bootstrap/env'
import { describe, expect, it } from 'vitest'

describe('env runtime contract', () => {
  it('accepts runtime env', () => {
    expect(parseEnv({})).toEqual({})
  })

  it('derives a minimal config', () => {
    const config = createAppConfig(parseEnv({}))

    expect(config).toEqual({ featureFlags: {} })
  })
})
