/**
 * Route paths shared by every layer, so links never hardcode URLs.
 */
export const paths = {
  home: '/',
  login: '/login',
} as const

/** Where signed-in users land: after login and from the login page. */
export const defaultRoute = paths.home
