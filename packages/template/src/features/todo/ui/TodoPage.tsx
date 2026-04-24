import { zodResolver } from '@hookform/resolvers/zod'
import { formatAppError } from '@shared/kernel/AppError'
import { Button } from '@shared/ui/atoms/Button'
import { Card, CardHeader } from '@shared/ui/atoms/Card'
import { Input } from '@shared/ui/atoms/Input'
import { Row, Stack } from '@shared/ui/atoms/Layout'
import { Alert, Eyebrow, Muted, Title } from '@shared/ui/atoms/Typography'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { Todo } from '../domain/Todo'
import { useCreateTodo, useRemoveTodo, useTodos, useToggleTodo, useUpdateTodo } from './todoHooks'

const createTodoSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).trim().min(2, 'Title is too short'),
})

type CreateTodoForm = z.infer<typeof createTodoSchema>

export const TodoPage = () => {
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const form = useForm<CreateTodoForm>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: { title: '' },
    mode: 'onSubmit',
  })

  const todosQuery = useTodos()
  const createTodoMutation = useCreateTodo()
  const toggleTodoMutation = useToggleTodo()
  const updateTodoMutation = useUpdateTodo()
  const removeTodoMutation = useRemoveTodo()

  const onSubmit = form.handleSubmit((data) => {
    createTodoMutation.mutate(data, {
      onSuccess: () => {
        form.reset({ title: '' })
      },
    })
  })

  const activeError =
    todosQuery.error ??
    createTodoMutation.error ??
    toggleTodoMutation.error ??
    updateTodoMutation.error ??
    removeTodoMutation.error
  const todos = todosQuery.data ?? []

  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id)
    setEditingTitle(todo.title)
  }

  const saveEdit = (todoId: string) => {
    updateTodoMutation.mutate(
      { id: todoId, input: { title: editingTitle } },
      {
        onSuccess: () => {
          setEditingTodoId(null)
          setEditingTitle('')
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <Eyebrow>Todo feature</Eyebrow>
          <h2>Todo board</h2>
          <Muted>Simple protected CRUD flow for the canonical business slice.</Muted>
        </div>
      </CardHeader>

      {activeError ? <Alert>{formatAppError(activeError)}</Alert> : null}

      <form
        onSubmit={(event) => {
          void onSubmit(event)
        }}
      >
        <Stack>
          <label>
            <span>Title</span>
            <Input type="text" {...form.register('title')} required />
            {form.formState.errors.title ? <Muted>{form.formState.errors.title.message}</Muted> : null}
          </label>
          <Row>
            <Button type="submit" disabled={createTodoMutation.isPending}>
              {createTodoMutation.isPending ? 'Saving…' : 'Add todo'}
            </Button>
            <Muted>Protected route backed by in-memory feature state.</Muted>
          </Row>
        </Stack>
      </form>

      <Stack>
        <Title>Todo list</Title>
        {todosQuery.isLoading ? <Muted>Loading todos…</Muted> : null}
        {!todosQuery.isLoading && todos.length === 0 ? (
          <Muted>No todos yet. Add one to verify the flow.</Muted>
        ) : null}
        <ul>
          {todos.map((todo) => {
            const isEditing = editingTodoId === todo.id

            return (
              <li key={todo.id} aria-label={`Todo ${todo.title}`}>
                <Stack>
                  <label>
                    <Input
                      type="checkbox"
                      aria-label={`Mark ${todo.title} as complete`}
                      checked={todo.completed}
                      onChange={() => {
                        toggleTodoMutation.mutate(todo.id)
                      }}
                    />
                    <span>{todo.title}</span>
                  </label>
                  <Muted>Status: {todo.completed ? 'done' : 'pending'}</Muted>
                  {isEditing ? (
                    <Row>
                      <Input
                        type="text"
                        aria-label={`Edit title for ${todo.title}`}
                        value={editingTitle}
                        onChange={(event) => {
                          setEditingTitle(event.target.value)
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          saveEdit(todo.id)
                        }}
                      >
                        Save {editingTitle}
                      </Button>
                    </Row>
                  ) : (
                    <Row>
                      <Button
                        type="button"
                        onClick={() => {
                          startEditing(todo)
                        }}
                      >
                        Edit {todo.title}
                      </Button>
                    </Row>
                  )}
                  <Row>
                    <Button
                      type="button"
                      onClick={() => {
                        removeTodoMutation.mutate(todo.id)
                      }}
                    >
                      Delete {todo.title}
                    </Button>
                  </Row>
                </Stack>
              </li>
            )
          })}
        </ul>
      </Stack>
    </Card>
  )
}
