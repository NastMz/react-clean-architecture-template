import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { type NewTodo, newTodoSchema } from '@/entities/todo'
import { getErrorMessage } from '@/shared/api'
import { Alert, Button, TextField } from '@/shared/ui'

import { useCreateTodo } from '../api/useCreateTodo'
import styles from './CreateTodoForm.module.css'

export function CreateTodoForm() {
  const createMutation = useCreateTodo()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewTodo>({
    resolver: zodResolver(newTodoSchema),
    defaultValues: { title: '' },
  })

  const submit = handleSubmit((values) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        reset()
      },
    })
  })

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <div className={styles.row}>
        <TextField
          label="New todo"
          placeholder="What needs to be done?"
          autoComplete="off"
          error={errors.title?.message}
          {...register('title')}
        />
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Adding…' : 'Add todo'}
        </Button>
      </div>
      {createMutation.isError ? <Alert>{getErrorMessage(createMutation.error)}</Alert> : null}
    </form>
  )
}
