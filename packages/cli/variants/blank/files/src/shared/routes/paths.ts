/**
 * Route paths shared by every layer, so links never hardcode URLs.
 */
export const paths = {
  home: '/',
} as const

/** Where users land from `/` and after redirects. */
export const defaultRoute = paths.home
