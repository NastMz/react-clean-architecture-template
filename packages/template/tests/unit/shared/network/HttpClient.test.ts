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

  it('maps 503 responses to ServiceUnavailable with status metadata', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'temporarily unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const client = createFetchHttpClient({ baseUrl: 'https://api.example.com' })
    const result = await client.request({
      method: 'GET',
      url: '/auth/session',
    })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.kind).toBe('ServiceUnavailable')
      expect(result.error.message).toBe('Service unavailable')
      expect(result.error.cause).toEqual({ statusCode: 503 })
    }
  })

  it('keeps mapping 409 responses to Conflict', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'conflict' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const client = createFetchHttpClient({ baseUrl: 'https://api.example.com' })
    const result = await client.request({
      method: 'POST',
      url: '/auth/login',
      body: { email: 'test@example.com' },
    })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.kind).toBe('Conflict')
      expect(result.error.cause).toEqual({ statusCode: 409 })
    }
  })
})
