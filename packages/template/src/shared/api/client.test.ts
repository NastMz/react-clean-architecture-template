import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { server } from '../../../mocks/node'
import { authToken } from './auth-token'
import { apiClient } from './client'
import { ApiError } from './errors'

const itemSchema = z.object({ id: z.number() })

describe('apiClient', () => {
  it('returns the parsed body of a successful response', async () => {
    server.use(http.get('*/api/items/1', () => HttpResponse.json({ id: 1, extra: 'ignored' })))

    await expect(apiClient.get('/items/1', itemSchema)).resolves.toEqual({ id: 1 })
  })

  it('sends the stored token as a bearer header', async () => {
    let authorization: string | null = null
    server.use(
      http.get('*/api/items/1', ({ request }) => {
        authorization = request.headers.get('Authorization')
        return HttpResponse.json({ id: 1 })
      }),
    )
    authToken.set('secret-token')

    await apiClient.get('/items/1', itemSchema)

    expect(authorization).toBe('Bearer secret-token')
  })

  it('throws an ApiError with the server message and status on failure', async () => {
    server.use(
      http.post('*/api/items', () =>
        HttpResponse.json({ message: 'Already exists' }, { status: 409 }),
      ),
    )

    const request = apiClient.post('/items', { id: 1 }, itemSchema)

    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({ status: 409, message: 'Already exists' })
  })

  it('falls back to a generic message when the error body is not JSON', async () => {
    server.use(http.get('*/api/items/1', () => new HttpResponse('boom', { status: 500 })))

    await expect(apiClient.get('/items/1', itemSchema)).rejects.toMatchObject({
      status: 500,
      message: 'Request failed with status 500',
    })
  })

  it('rejects payloads that do not match the schema', async () => {
    server.use(http.get('*/api/items/1', () => HttpResponse.json({ id: 'not-a-number' })))

    await expect(apiClient.get('/items/1', itemSchema)).rejects.toMatchObject({
      message: 'Unexpected response from GET /items/1',
    })
  })
})
