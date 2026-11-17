import type { QueryClient } from '@tanstack/react-query'
import { type MiddlewareFunction, redirect } from 'react-router'

import { sessionQueries } from '@/entities/session'
import { defaultRoute, paths } from '@/shared/routes'

/**
 * Runs before any loader of the protected branch, so child loaders never fire
 * requests for an anonymous user. Loaders alone run in parallel and cannot
 * gate each other; middleware can.
 */
export const requireSession =
  (queryClient: QueryClient): MiddlewareFunction =>
  async ({ request }) => {
    const user = await queryClient.query(sessionQueries.currentUser())

    if (!user) {
      const { pathname, search } = new URL(request.url)
      const params = new URLSearchParams({ redirectTo: `${pathname}${search}` })
      throw redirect(`${paths.login}?${params.toString()}`)
    }
  }

/** Keeps signed-in users away from the login page. */
export const redirectIfAuthenticated =
  (queryClient: QueryClient): MiddlewareFunction =>
  async () => {
    const user = await queryClient.query(sessionQueries.currentUser())

    if (user) {
      throw redirect(defaultRoute)
    }
  }
