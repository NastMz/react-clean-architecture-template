import type { RequestHandler } from 'msw'

/**
 * Mock API handlers, used by the dev server and by tests. Example:
 *
 *   import { http, HttpResponse } from 'msw'
 *   http.get('*\/api/projects', () => HttpResponse.json([{ id: '1', name: 'Demo' }]))
 */
export const handlers: RequestHandler[] = []
