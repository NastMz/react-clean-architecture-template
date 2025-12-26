import { useContainer } from '@app/composition/useContainer'
import { formatAppError } from '@shared/domain/errors/AppError'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { useState } from 'react'

import ui from '../../styles/ui.module.css'

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
    <section className={ui.panel}>
      <div className={ui.panelHeader}>
        <div>
          <p className={ui.eyebrow}>Todo feature</p>
          <h2>Task manager demo</h2>
          <p className={ui.muted}>
            Demonstrates CRUD via repository pattern, TanStack Query cache invalidation.
          </p>
        </div>
      </div>

      {activeError ? <div className={ui.alert}>{formatAppError(activeError)}</div> : null}

      <form className={ui.stack} onSubmit={onSubmit}>
        <label className={ui.stack}>
          <span>New Task</span>
          <div className={ui.row}>
            <input
              className={ui.textField}
              name="title"
              type="text"
              placeholder="Buy milk, write tests…"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <button
              type="submit"
              className={`${ui.btn} ${ui.primary}`}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Adding…' : 'Add'}
            </button>
          </div>
        </label>
      </form>

      {todosQuery.isLoading ? (
        <p className={ui.muted}>Loading…</p>
      ) : (
        <ul className={ui.todoList}>
          {todosQuery.data?.map((todo) => (
            <li key={todo.id} className={ui.todoItem}>
              <label className={ui.row}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleMutation.mutate(todo.id)}
                  disabled={toggleMutation.isPending}
                />
                <span className={todo.completed ? ui.strikethrough : ''}>{todo.title}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
