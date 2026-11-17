import { delay, http, HttpResponse } from 'msw'

import { db, type MockUser, tokenForUser, userIdFromToken } from './db'

/** Matches the API on any origin, so it works with any `VITE_API_URL` host. */
const API = '*/api'

const error = (status: number, message: string) => HttpResponse.json({ message }, { status })

const toUserDto = ({ id, email, name }: MockUser) => ({ id, email, name })

const authenticate = (request: Request) => {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  const userId = userIdFromToken(token)
  return userId ? db.users.findById(userId) : undefined
}

const readJson = async (request: Request): Promise<Record<string, unknown>> => {
  try {
    const body: unknown = await request.json()
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    await delay()
    const { email, password } = await readJson(request)
    const user =
      typeof email === 'string' && typeof password === 'string'
        ? db.users.findByCredentials(email, password)
        : undefined

    if (!user) {
      return error(401, 'Invalid email or password')
    }

    return HttpResponse.json({ token: tokenForUser(user.id), user: toUserDto(user) })
  }),

  http.post(`${API}/auth/logout`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/auth/me`, ({ request }) => {
    const user = authenticate(request)
    return user ? HttpResponse.json(toUserDto(user)) : error(401, 'Authentication required')
  }),

  // Add handlers for your endpoints here, e.g. http.get(`${API}/projects`, ...).
]
