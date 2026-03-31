import { createAppConfig } from '@app/bootstrap/config'
import { parseEnv } from '@app/bootstrap/env'
import { describe, expect, it } from 'vitest'

describe('env runtime contract', () => {
  it('requires api base url when http mode is enabled', () => {
    expect(() =>
      parseEnv({
        VITE_USE_HTTP: 'true',
      }),
    ).toThrow(/VITE_API_BASE_URL is required when VITE_USE_HTTP=true/)
  })

  it('rejects invalid api base url in http mode', () => {
    expect(() =>
      parseEnv({
        VITE_USE_HTTP: 'true',
        VITE_API_BASE_URL: 'not-a-url',
      }),
    ).toThrow()
  })

  it('does not invent a fake api base url outside http mode', () => {
    const config = createAppConfig(parseEnv({ VITE_USE_HTTP: 'false' }))

    expect(config.useHttp).toBe(false)
    expect(config.apiBaseUrl).toBe('')
  })
})
