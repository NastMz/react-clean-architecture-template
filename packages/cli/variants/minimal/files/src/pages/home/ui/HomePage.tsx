import { useCurrentUser } from '@/entities/session'
import { Card } from '@/shared/ui'

export function HomePage() {
  const user = useCurrentUser()

  return (
    <Card
      eyebrow="Home"
      title={user ? `Welcome, ${user.name}` : 'Welcome'}
      description="Your app starts here."
    >
      <p>
        Add your first screen with <code>pnpm slice pages &lt;name&gt;</code> and register it in{' '}
        <code>src/app/routes/routes.tsx</code>.
      </p>
    </Card>
  )
}
