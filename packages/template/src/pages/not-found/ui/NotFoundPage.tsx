import { Link } from 'react-router'

import { paths } from '@/shared/routes'
import { Card } from '@/shared/ui'

export function NotFoundPage() {
  return (
    <Card
      eyebrow="404"
      title="Page not found"
      description="The page you are looking for does not exist or was moved."
    >
      <Link to={paths.home}>Go back home</Link>
    </Card>
  )
}
