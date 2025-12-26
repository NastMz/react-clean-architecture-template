import { useLogin, useLogout, useSession } from '@features/auth/adapters/authAdapters'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatAppError } from '@shared/domain/errors/AppError'
import { Button } from '@shared/presentation/components/atoms/Button'
import { Card, CardHeader } from '@shared/presentation/components/atoms/Card'
import { Input } from '@shared/presentation/components/atoms/Input'
import { Row, Stack } from '@shared/presentation/components/atoms/Layout'
import { Alert, Eyebrow, Muted, Title } from '@shared/presentation/components/atoms/Typography'
import { SessionCard } from '@shared/presentation/components/molecules/SessionCard'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

/**
 * Example form-driven page using queries and mutations
 * Shows a simple session-like flow with React Query
 * Serves as a template for wiring UI to adapters and use cases
 */
const credentialsSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type CredentialsForm = z.infer<typeof credentialsSchema>

export const AuthPage = () => {
  const form = useForm<CredentialsForm>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: 'demo@example.com', password: 'demo123' },
    mode: 'onSubmit',
  })

  // Import hooks directly from adapters - no need to touch the DI container!
  const sessionQuery = useSession()
  const loginMutation = useLogin()
  const logoutMutation = useLogout()

  const onSubmit = form.handleSubmit((data) => {
    loginMutation.mutate(data)
  })

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
        <form
          onSubmit={(e) => {
            void onSubmit(e)
          }}
        >
          <Stack>
            <label>
              <span>Email</span>
              <Input type="email" {...form.register('email')} required />
              {form.formState.errors.email ? (
                <Muted>{form.formState.errors.email.message}</Muted>
              ) : null}
            </label>
            <label>
              <span>Password</span>
              <Input type="password" {...form.register('password')} required />
              {form.formState.errors.password ? (
                <Muted>{form.formState.errors.password.message}</Muted>
              ) : null}
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
