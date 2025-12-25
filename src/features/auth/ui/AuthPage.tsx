import { useContainer } from '@app/composition/useContainer'
import { formatAppError } from '@shared/domain/errors/AppError'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { useState } from 'react'

export const AuthPage = () => {
  const { adapters } = useContainer()
  const [credentials, setCredentials] = useState({ email: 'demo@example.com', password: 'demo123' })

  const sessionQuery = useQuery(adapters.auth.queries.session())
  const loginMutation = useMutation(adapters.auth.mutations.login())
  const logoutMutation = useMutation(adapters.auth.mutations.logout())

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    loginMutation.mutate(credentials)
  }

  const activeError = sessionQuery.error ?? loginMutation.error ?? logoutMutation.error

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Auth feature</p>
          <h2>Session demo</h2>
          <p className="muted">Login is validated and persisted in-memory via a repository port.</p>
        </div>
      </div>

      {activeError ? <div className="alert">{formatAppError(activeError)}</div> : null}

      {sessionQuery.data ? (
        <div className="session-card">
          <p className="eyebrow">Logged in</p>
          <p className="title">{sessionQuery.data.user.name}</p>
          <p className="muted">{sessionQuery.data.user.email}</p>
          <button
            className="btn ghost"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? 'Closing session…' : 'Logout'}
          </button>
        </div>
      ) : (
        <form className="stack" onSubmit={onSubmit}>
          <label className="stack">
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={credentials.email}
              onChange={(event) =>
                setCredentials((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
          </label>
          <label className="stack">
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={credentials.password}
              onChange={(event) =>
                setCredentials((prev) => ({ ...prev, password: event.target.value }))
              }
              required
            />
          </label>
          <div className="row">
            <button type="submit" className="btn primary" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Signing in…' : 'Login'}
            </button>
            <p className="muted">Use demo@example.com / demo123</p>
          </div>
        </form>
      )}
    </section>
  )
}
