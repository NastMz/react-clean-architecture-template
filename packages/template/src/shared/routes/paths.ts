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

/** Where signed-in users land: after login, from `/` and from the login page. */
export const defaultRoute = paths.todos
