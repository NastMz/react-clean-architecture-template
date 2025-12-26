import { useContainer } from '@app/composition/useContainer'
import { formatAppError } from '@shared/domain/errors/AppError'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { useState } from 'react'

import ui from '../../styles/ui.module.css'

/**
 * Example form-driven page using queries and mutations
 * Shows a simple session-like flow with React Query
 * Serves as a template for wiring UI to adapters and use cases
 */
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
    <section className={ui.panel}>
      <div className={ui.panelHeader}>
        <div>
          <p className={ui.eyebrow}>Auth feature</p>
          <h2>Session demo</h2>
          <p className={ui.muted}>
            Login is validated and persisted in-memory via a repository port.
          </p>
        </div>
      </div>

      {activeError ? <div className={ui.alert}>{formatAppError(activeError)}</div> : null}

      {sessionQuery.data ? (
        <div className={ui.sessionCard}>
          <p className={ui.eyebrow}>Logged in</p>
          <p className={ui.title}>{sessionQuery.data.user.name}</p>
          <p className={ui.muted}>{sessionQuery.data.user.email}</p>
          <button
            className={`${ui.btn} ${ui.ghost}`}
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? 'Closing session…' : 'Logout'}
          </button>
        </div>
      ) : (
        <form className={ui.stack} onSubmit={onSubmit}>
          <label className={ui.stack}>
            <span>Email</span>
            <input
              className={ui.textField}
              name="email"
              type="email"
              value={credentials.email}
              onChange={(event) =>
                setCredentials((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
          </label>
          <label className={ui.stack}>
            <span>Password</span>
            <input
              className={ui.textField}
              name="password"
              type="password"
              value={credentials.password}
              onChange={(event) =>
                setCredentials((prev) => ({ ...prev, password: event.target.value }))
              }
              required
            />
          </label>
          <div className={ui.row}>
            <button
              type="submit"
              className={`${ui.btn} ${ui.primary}`}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in…' : 'Login'}
            </button>
            <p className={ui.muted}>Use demo@example.com / demo123</p>
          </div>
        </form>
      )}
    </section>
  )
}
