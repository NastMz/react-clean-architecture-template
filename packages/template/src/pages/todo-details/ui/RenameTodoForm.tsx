import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { type NewTodo, newTodoSchema, type Todo } from '@/entities/todo'
import { getErrorMessage } from '@/shared/api'
import { Alert, Button, TextField } from '@/shared/ui'

import { useRenameTodo } from '../api/useTodoMutations'
import styles from './TodoDetailsPage.module.css'

export function RenameTodoForm({ todo }: { todo: Todo }) {
  const renameMutation = useRenameTodo(todo.id)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<NewTodo>({
    resolver: zodResolver(newTodoSchema),
    defaultValues: { title: todo.title },
  })

  const submit = handleSubmit(({ title }) => {
    renameMutation.mutate(title, {
      onSuccess: (updated) => {
        reset({ title: updated.title })
      },
    })
  })

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <div className={styles.row}>
        <TextField label="Title" error={errors.title?.message} {...register('title')} />
        <Button type="submit" variant="secondary" disabled={!isDirty || renameMutation.isPending}>
          {renameMutation.isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
      {renameMutation.isError ? <Alert>{getErrorMessage(renameMutation.error)}</Alert> : null}
    </form>
  )
}
