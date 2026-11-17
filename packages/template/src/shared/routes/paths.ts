/**
 * Route paths shared by every layer, so links never hardcode URLs.
 */
export const paths = {
  home: '/',
  login: '/login',
  todos: '/todos',
  todoDetails: (todoId: string) => `/todos/${encodeURIComponent(todoId)}`,
} as const

/** Route patterns consumed by the router configuration. */
export const routePatterns = {
  todoDetails: '/todos/:todoId',
} as const

/**
 * Returns `target` only when it is a same-origin absolute path, so a crafted
 * `?redirectTo=https://evil.example` cannot turn login into an open redirect.
 */
export const getSafeRedirect = (target: string | null | undefined, fallback: string): string =>
  target?.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\')
    ? target
    : fallback
