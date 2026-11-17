import { useQuery } from '@tanstack/react-query'

import { sessionQueries } from '../api/sessionQueries'

/** The signed-in user, or `null`. Route loaders prime this query before render. */
export const useCurrentUser = () => useQuery(sessionQueries.currentUser()).data ?? null
