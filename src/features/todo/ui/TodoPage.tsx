import { useContainer } from '@app/composition/useContainer'
import { formatAppError } from '@shared/domain/errors/AppError'
import { Button } from '@shared/presentation/components/atoms/Button'
import { Card, CardHeader } from '@shared/presentation/components/atoms/Card'
import { Input } from '@shared/presentation/components/atoms/Input'
import { Row, Stack } from '@shared/presentation/components/atoms/Layout'
import { Alert, Eyebrow, Muted } from '@shared/presentation/components/atoms/Typography'
import { TodoItem, TodoList } from '@shared/presentation/components/molecules/TodoList'
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
    <Card>
      <CardHeader>
        <div>
          <Eyebrow>Todo feature</Eyebrow>
          <h2>Task manager demo</h2>
          <Muted>
            Demonstrates CRUD via repository pattern, TanStack Query cache invalidation.
          </Muted>
        </div>
      </CardHeader>

      {activeError ? <Alert>{formatAppError(activeError)}</Alert> : null}

      <form onSubmit={onSubmit}>
        <Stack>
          <label>
            <span>New Task</span>
            <Row>
              <Input
                name="title"
                type="text"
                placeholder="Buy milk, write tests…"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding…' : 'Add'}
              </Button>
            </Row>
          </label>
        </Stack>
      </form>

      {todosQuery.isLoading ? (
        <Muted>Loading…</Muted>
      ) : (
        <TodoList>
          {todosQuery.data?.map((todo) => (
            <TodoItem
              key={todo.id}
              completed={todo.completed}
              onToggle={() => toggleMutation.mutate(todo.id)}
            >
              {todo.title}
            </TodoItem>
          ))}
        </TodoList>
      )}
    </Card>
  )
}
