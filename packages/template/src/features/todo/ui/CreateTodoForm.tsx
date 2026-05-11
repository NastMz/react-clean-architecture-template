import { Button } from '@shared/ui/atoms/Button'
import { Input } from '@shared/ui/atoms/Input'
import { Muted } from '@shared/ui/atoms/Typography'
import type { FormEventHandler, InputHTMLAttributes } from 'react'

import styles from './CreateTodoForm.module.css'

interface CreateTodoFormProps {
  isSubmitting: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  titleError?: string
  titleInputProps: InputHTMLAttributes<HTMLInputElement>
}

export const CreateTodoForm = ({
  isSubmitting,
  onSubmit,
  titleError,
  titleInputProps,
}: CreateTodoFormProps) => {
  return (
    <form className={styles.form} aria-label="Create todo form" onSubmit={onSubmit}>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          <span>Title</span>
          <Input type="text" required {...titleInputProps} />
          {titleError ? <Muted>{titleError}</Muted> : null}
        </label>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Add todo'}
        </Button>
      </div>
      <Muted>Protected route backed by in-memory feature state.</Muted>
    </form>
  )
}
