import { createFetchHttpClient } from '@shared/network/HttpClient'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

describe('HttpClient runtime contract', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns validated json payloads when schema matches', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ token: 'abc123' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const client = createFetchHttpClient({ baseUrl: 'https://api.example.com' })
    const result = await client.request({
      method: 'GET',
      url: '/auth/session',
      responseSchema: z.object({ token: z.string().min(1) }),
    })

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.data).toEqual({ token: 'abc123' })
    }
  })

  it('rejects invalid json payloads instead of casting them blindly', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ token: '' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const client = createFetchHttpClient({ baseUrl: 'https://api.example.com' })
    const result = await client.request({
      method: 'GET',
      url: '/auth/session',
      responseSchema: z.object({ token: z.string().min(1) }),
    })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.kind).toBe('Validation')
      expect(result.error.message).toContain('Invalid response payload')
    }
  })
})
