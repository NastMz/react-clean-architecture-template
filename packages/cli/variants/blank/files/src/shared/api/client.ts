import type { ZodType } from 'zod'

import { env } from '@/shared/config'

import { ApiError } from './errors'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

interface SendOptions {
  body?: unknown
  signal?: AbortSignal
}

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body: unknown = await response.json()

    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      return body.message
    }
  } catch {
    // Non-JSON error bodies fall through to the generic message.
  }

  return `Request failed with status ${response.status}`
}

const send = async (
  method: HttpMethod,
  path: string,
  { body, signal }: SendOptions = {},
): Promise<Response> => {
  const headers = new Headers({ Accept: 'application/json' })

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(new URL(`${env.apiUrl}${path}`, window.location.origin), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response))
  }

  return response
}

const parseBody = async <T>(response: Response, schema: ZodType<T>, label: string): Promise<T> => {
  const data: unknown = response.status === 204 ? undefined : await response.json()
  const parsed = schema.safeParse(data)

  if (!parsed.success) {
    throw new ApiError(response.status, `Unexpected response from ${label}`, parsed.error.issues)
  }

  return parsed.data
}

/**
 * Thin fetch wrapper. Every response that carries data is validated with a Zod
 * schema, so the rest of the app only ever sees typed, trusted values.
 */
export const apiClient = {
  async get<T>(path: string, schema: ZodType<T>, options: { signal?: AbortSignal } = {}) {
    return parseBody(await send('GET', path, options), schema, `GET ${path}`)
  },
  async post<T>(path: string, body: unknown, schema: ZodType<T>) {
    return parseBody(await send('POST', path, { body }), schema, `POST ${path}`)
  },
  async patch<T>(path: string, body: unknown, schema: ZodType<T>) {
    return parseBody(await send('PATCH', path, { body }), schema, `PATCH ${path}`)
  },
  async delete(path: string): Promise<void> {
    await send('DELETE', path)
  },
}
