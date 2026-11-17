import { useNavigate, useSearchParams } from 'react-router'

import { LoginForm } from '@/features/auth'
import { getSafeRedirect, paths } from '@/shared/routes'
import { Alert, Card } from '@/shared/ui'

import styles from './LoginPage.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = getSafeRedirect(searchParams.get('redirectTo'), paths.todos)

  return (
    <Card
      className={styles.card}
      eyebrow="Welcome back"
      title="Sign in"
      description="Sign in to manage your todos."
    >
      <div className={styles.stack}>
        <Alert tone="info">
          Demo account: <strong>demo@example.com</strong> / <strong>demo123</strong>
        </Alert>
        <LoginForm
          onSuccess={() => {
            void navigate(redirectTo, { replace: true })
          }}
        />
      </div>
    </Card>
  )
}
