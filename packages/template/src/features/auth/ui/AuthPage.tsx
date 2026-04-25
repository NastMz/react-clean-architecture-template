import { zodResolver } from '@hookform/resolvers/zod'
import { formatAppError } from '@shared/kernel/AppError'
import { Card, CardHeader } from '@shared/ui/atoms/Card'
import { Alert, Eyebrow, Muted } from '@shared/ui/atoms/Typography'
import type { FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { AuthenticatedSessionPanel } from './AuthenticatedSessionPanel'
import { useLogin, useLogout, useSession } from './authHooks'
import { LoginForm } from './LoginForm'

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

  // UI consumes feature hooks; composition stays outside this screen.
  const sessionQuery = useSession()
  const loginMutation = useLogin()
  const logoutMutation = useLogout()

  const submitCredentials = form.handleSubmit((data) => {
    loginMutation.mutate(data)
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    void submitCredentials(event)
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
        <AuthenticatedSessionPanel
          email={sessionQuery.data.user.email}
          isLoggingOut={logoutMutation.isPending}
          name={sessionQuery.data.user.name}
          onLogout={() => logoutMutation.mutate()}
        />
      ) : (
        <LoginForm
          emailError={form.formState.errors.email?.message}
          emailInputProps={form.register('email')}
          isSubmitting={loginMutation.isPending}
          onSubmit={handleSubmit}
          passwordError={form.formState.errors.password?.message}
          passwordInputProps={form.register('password')}
        />
      )}
    </Card>
  )
}
