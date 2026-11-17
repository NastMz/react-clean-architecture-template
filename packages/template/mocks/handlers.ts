import { delay, http, HttpResponse } from 'msw'

import { db, type MockTodo, type MockUser, tokenForUser, userIdFromToken } from './db'

/** Matches the API on any origin, so it works with any `VITE_API_URL` host. */
const API = '*/api'
const TITLE_MAX_LENGTH = 120

const error = (status: number, message: string) => HttpResponse.json({ message }, { status })

const toUserDto = ({ id, email, name }: MockUser) => ({ id, email, name })

const toTodoDto = ({ id, title, completed, createdAt }: MockTodo) => ({
  id,
  title,
  completed,
  createdAt,
})

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

const validateTitle = (value: unknown): string | { error: string } => {
  const title = typeof value === 'string' ? value.trim() : ''

  if (!title) {
    return { error: 'Title is required' }
  }

  if (title.length > TITLE_MAX_LENGTH) {
    return { error: `Title must be ${TITLE_MAX_LENGTH} characters or fewer` }
  }

  return title
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

  http.get(`${API}/todos`, async ({ request }) => {
    await delay()
    const user = authenticate(request)

    if (!user) {
      return error(401, 'Authentication required')
    }

    return HttpResponse.json(db.todos.list(user.id).map(toTodoDto))
  }),

  http.get(`${API}/todos/:todoId`, ({ request, params }) => {
    const user = authenticate(request)

    if (!user) {
      return error(401, 'Authentication required')
    }

    const todo = db.todos.find(user.id, String(params.todoId))
    return todo ? HttpResponse.json(toTodoDto(todo)) : error(404, 'Todo not found')
  }),

  http.post(`${API}/todos`, async ({ request }) => {
    await delay()
    const user = authenticate(request)

    if (!user) {
      return error(401, 'Authentication required')
    }

    const title = validateTitle((await readJson(request)).title)

    if (typeof title !== 'string') {
      return error(400, title.error)
    }

    if (db.todos.hasTitle(user.id, title)) {
      return error(409, 'A todo with this title already exists')
    }

    return HttpResponse.json(toTodoDto(db.todos.create(user.id, title)), { status: 201 })
  }),

  http.patch(`${API}/todos/:todoId`, async ({ request, params }) => {
    await delay()
    const user = authenticate(request)

    if (!user) {
      return error(401, 'Authentication required')
    }

    const todo = db.todos.find(user.id, String(params.todoId))

    if (!todo) {
      return error(404, 'Todo not found')
    }

    const body = await readJson(request)
    const changes: Partial<Pick<MockTodo, 'title' | 'completed'>> = {}

    if (body.title !== undefined) {
      const title = validateTitle(body.title)

      if (typeof title !== 'string') {
        return error(400, title.error)
      }

      if (db.todos.hasTitle(user.id, title, todo.id)) {
        return error(409, 'A todo with this title already exists')
      }

      changes.title = title
    }

    if (typeof body.completed === 'boolean') {
      changes.completed = body.completed
    }

    const updated = db.todos.update(todo.id, changes)
    return updated ? HttpResponse.json(toTodoDto(updated)) : error(404, 'Todo not found')
  }),

  http.delete(`${API}/todos/:todoId`, async ({ request, params }) => {
    await delay()
    const user = authenticate(request)

    if (!user) {
      return error(401, 'Authentication required')
    }

    const todo = db.todos.find(user.id, String(params.todoId))

    if (!todo) {
      return error(404, 'Todo not found')
    }

    db.todos.remove(todo.id)
    return new HttpResponse(null, { status: 204 })
  }),
]
