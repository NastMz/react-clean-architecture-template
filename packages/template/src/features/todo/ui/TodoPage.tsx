import { zodResolver } from '@hookform/resolvers/zod'
import { formatAppError } from '@shared/kernel/AppError'
import { Card, CardHeader } from '@shared/ui/atoms/Card'
import { Alert, Eyebrow, Muted } from '@shared/ui/atoms/Typography'
import { type FormEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { Todo } from '../domain/Todo'
import { CreateTodoForm } from './CreateTodoForm'
import { useCreateTodo, useRemoveTodo, useTodos, useToggleTodo, useUpdateTodo } from './todoHooks'
import { TodoList } from './TodoList'

const createTodoSchema = z.object({
  title: z
    .string({ error: 'Title is required' })
    .trim()
    .min(1, { error: 'Title is required' })
    .min(2, 'Title is too short'),
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

  const submitTodo = form.handleSubmit((data) => {
    createTodoMutation.mutate(data, {
      onSuccess: () => {
        form.reset({ title: '' })
      },
    })
  })

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    void submitTodo(event)
  }

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

      <CreateTodoForm
        isSubmitting={createTodoMutation.isPending}
        onSubmit={handleCreateSubmit}
        titleError={form.formState.errors.title?.message}
        titleInputProps={form.register('title')}
      />

      <TodoList
        editingTitle={editingTitle}
        editingTodoId={editingTodoId}
        isLoading={todosQuery.isLoading}
        onDeleteTodo={(todoId) => {
          removeTodoMutation.mutate(todoId)
        }}
        onEditTitleChange={setEditingTitle}
        onSaveEdit={saveEdit}
        onStartEdit={startEditing}
        onToggleTodo={(todoId) => {
          toggleTodoMutation.mutate(todoId)
        }}
        todos={todos}
      />
    </Card>
  )
}
