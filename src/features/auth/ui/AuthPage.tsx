import { useLogin, useLogout, useSession } from '@features/auth/adapters/authAdapters'
import { formatAppError } from '@shared/domain/errors/AppError'
import { Button } from '@shared/presentation/components/atoms/Button'
import { Card, CardHeader } from '@shared/presentation/components/atoms/Card'
import { Input } from '@shared/presentation/components/atoms/Input'
import { Row, Stack } from '@shared/presentation/components/atoms/Layout'
import { Alert, Eyebrow, Muted, Title } from '@shared/presentation/components/atoms/Typography'
import { SessionCard } from '@shared/presentation/components/molecules/SessionCard'
import type { FormEvent } from 'react'
import { useState } from 'react'

/**
 * Example form-driven page using queries and mutations
 * Shows a simple session-like flow with React Query
 * Serves as a template for wiring UI to adapters and use cases
 */
export const AuthPage = () => {
  const [credentials, setCredentials] = useState({ email: 'demo@example.com', password: 'demo123' })

  // Import hooks directly from adapters - no need to touch the DI container!
  const sessionQuery = useSession()
  const loginMutation = useLogin()
  const logoutMutation = useLogout()

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    loginMutation.mutate(credentials)
  }

  const activeError = sessionQuery.error ?? loginMutation.error ?? logoutMutation.error

  return (
    <Card>
      <CardHeader>
        <div>
          <Eyebrow>Auth feature</Eyebrow>
          <h2>Session demo</h2>
          <Muted>Login is validated and persisted in-memory via a repository port.</Muted>
        </div>
      </CardHeader>

      {activeError ? <Alert>{formatAppError(activeError)}</Alert> : null}

      {sessionQuery.data ? (
        <SessionCard>
          <Eyebrow>Logged in</Eyebrow>
          <Title>{sessionQuery.data.user.name}</Title>
          <Muted>{sessionQuery.data.user.email}</Muted>
          <Button
            variant="ghost"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? 'Closing session…' : 'Logout'}
          </Button>
        </SessionCard>
      ) : (
        <form onSubmit={onSubmit}>
          <Stack>
            <label>
              <span>Email</span>
              <Input
                name="email"
                type="email"
                value={credentials.email}
                onChange={(event) =>
                  setCredentials((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
            </label>
            <label>
              <span>Password</span>
              <Input
                name="password"
                type="password"
                value={credentials.password}
                onChange={(event) =>
                  setCredentials((prev) => ({ ...prev, password: event.target.value }))
                }
                required
              />
            </label>
            <Row>
              <Button type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Signing in…' : 'Login'}
              </Button>
              <Muted>Use demo@example.com / demo123</Muted>
            </Row>
          </Stack>
        </form>
      )}
    </Card>
  )
}
