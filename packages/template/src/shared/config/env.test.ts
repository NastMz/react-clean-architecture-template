import { describe, expect, it } from 'vitest'

import { parseEnv } from './env'

describe('parseEnv', () => {
  it('defaults the API URL and enables mocking in development', () => {
    expect(parseEnv({ DEV: true })).toEqual({ apiUrl: '/api', apiMocking: 'enabled' })
  })

  it('disables mocking by default outside development', () => {
    expect(parseEnv({ DEV: false }).apiMocking).toBe('disabled')
  })

  it('respects explicit values and strips trailing slashes', () => {
    expect(
      parseEnv({
        DEV: true,
        VITE_API_URL: 'https://api.example.com/',
        VITE_API_MOCKING: 'disabled',
      }),
    ).toEqual({ apiUrl: 'https://api.example.com', apiMocking: 'disabled' })
  })

  it('rejects an invalid mocking flag', () => {
    expect(() => parseEnv({ VITE_API_MOCKING: 'yes' })).toThrow()
  })
})
