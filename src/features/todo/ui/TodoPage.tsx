import { useContainer } from '@app/composition/useContainer'
import { formatAppError } from '@shared/domain/errors/AppError'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { useState } from 'react'

/**
 * Example list-and-form page
 * Demonstrates CRUD-style queries/mutations with React Query
 * Template for wiring UI actions to adapters and use cases
 */
export const TodoPage = () => {
  const { adapters } = useContainer()
  const [title, setTitle] = useState('')

  const todosQuery = useQuery(adapters.todo.queries.list())
  const createMutation = useMutation(adapters.todo.mutations.create())
  const toggleMutation = useMutation(adapters.todo.mutations.toggle())

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createMutation.mutate({ title }, { onSuccess: () => setTitle('') })
  }

  const activeError = todosQuery.error ?? createMutation.error ?? toggleMutation.error

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Todo feature</p>
          <h2>Task manager demo</h2>
          <p className="muted">
            Demonstrates CRUD via repository pattern, TanStack Query cache invalidation.
          </p>
        </div>
      </div>

      {activeError ? <div className="alert">{formatAppError(activeError)}</div> : null}

      <form className="stack" onSubmit={onSubmit}>
        <label className="stack">
          <span>New Task</span>
          <div className="row">
            <input
              name="title"
              type="text"
              placeholder="Buy milk, write tests…"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <button type="submit" className="btn primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding…' : 'Add'}
            </button>
          </div>
        </label>
      </form>

      {todosQuery.isLoading ? (
        <p className="muted">Loading…</p>
      ) : (
        <ul className="todo-list">
          {todosQuery.data?.map((todo) => (
            <li key={todo.id} className="todo-item">
              <label className="row">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleMutation.mutate(todo.id)}
                  disabled={toggleMutation.isPending}
                />
                <span className={todo.completed ? 'strikethrough' : ''}>{todo.title}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
