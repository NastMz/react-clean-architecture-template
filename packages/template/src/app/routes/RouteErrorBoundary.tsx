import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

import { isApiError } from '@/shared/api'
import { paths } from '@/shared/routes'
import { Card } from '@/shared/ui'

const describeError = (error: unknown): { title: string; message: string } => {
  if ((isApiError(error) || isRouteErrorResponse(error)) && error.status === 404) {
    return { title: 'Not found', message: 'We could not find what you were looking for.' }
  }

  if (isApiError(error)) {
    return { title: 'Request failed', message: error.message }
  }

  return { title: 'Something went wrong', message: 'An unexpected error occurred.' }
}

export function RouteErrorBoundary() {
  const error = useRouteError()
  const { title, message } = describeError(error)

  return (
    <Card eyebrow="Error" title={title} description={message}>
      <Link to={paths.home}>Go back home</Link>
    </Card>
  )
}
